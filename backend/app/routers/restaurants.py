from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from typing import Optional
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate, RestaurantResponse, RestaurantListResponse
from app.services.dependencies import get_current_user
from app.services.kafka_producer import publish_restaurant_created, publish_restaurant_updated
from app.mongodb import get_mongo_db
from app.services.mongo_repo import get_next_id, normalize_doc, now_utc
import os
import uuid
import shutil
import re

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


def _to_response(doc: dict) -> RestaurantResponse:
    return RestaurantResponse.model_validate(normalize_doc(doc))


_KEYWORD_TO_CUISINE = {
    "pasta": "Italian",
    "pizza": "Italian",
    "risotto": "Italian",
    "sushi": "Japanese",
    "ramen": "Japanese",
    "tempura": "Japanese",
    "taco": "Mexican",
    "burrito": "Mexican",
    "quesadilla": "Mexican",
    "curry": "Indian",
    "biryani": "Indian",
    "naan": "Indian",
    "burger": "American",
    "steak": "American",
    "bbq": "Korean",
    "kimchi": "Korean",
    "falafel": "Mediterranean",
    "hummus": "Mediterranean",
    "shawarma": "Mediterranean",
    "noodles": "Chinese",
    "dumpling": "Chinese",
}


def _build_keyword_pattern(raw_keywords: str) -> str:
    tokens = [re.escape(t) for t in re.findall(r"[a-zA-Z0-9$]+", raw_keywords or "") if len(t) > 1]
    if not tokens:
        return re.escape(raw_keywords or "")
    return "|".join(tokens)


def _derive_cuisine_hints(raw_keywords: str) -> list[str]:
    lowered = (raw_keywords or "").lower()
    found = []
    for token, cuisine in _KEYWORD_TO_CUISINE.items():
        if token in lowered and cuisine not in found:
            found.append(cuisine)
    return found


@router.post("", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
async def create_restaurant(payload: RestaurantCreate, current_user=Depends(get_current_user)):
    mongo = get_mongo_db()
    restaurant_id = await get_next_id(mongo, "restaurants")
    doc = {
        "_id": restaurant_id,
        **payload.model_dump(),
        "avg_rating": 0.0,
        "review_count": 0,
        "is_claimed": False,
        "owner_id": current_user.id,
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    await mongo.restaurants.insert_one(doc)
    publish_restaurant_created(restaurant_id=restaurant_id, name=doc["name"], cuisine_type=doc.get("cuisine_type"), city=doc.get("city"), owner_id=current_user.id)
    return _to_response(doc)


@router.get("", response_model=RestaurantListResponse)
async def list_restaurants(
    name: Optional[str] = Query(None),
    cuisine_type: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    zip_code: Optional[str] = Query(None),
    price_tier: Optional[str] = Query(None),
    keywords: Optional[str] = Query(None),
    skip: int = Query(0),
    limit: int = Query(10),
):
    mongo = get_mongo_db()
    filt = {}
    if zip_code:
        filt["zip_code"] = zip_code
    if price_tier:
        filt["price_tier"] = price_tier
    if name:
        filt["name"] = {"$regex": name, "$options": "i"}
    if cuisine_type:
        filt["cuisine_type"] = {"$regex": cuisine_type, "$options": "i"}
    if city:
        filt["city"] = {"$regex": city, "$options": "i"}
    if keywords:
        keyword_pattern = _build_keyword_pattern(keywords)
        filt["$or"] = [
            {"name": {"$regex": keyword_pattern, "$options": "i"}},
            {"description": {"$regex": keyword_pattern, "$options": "i"}},
            {"amenities": {"$regex": keyword_pattern, "$options": "i"}},
            {"cuisine_type": {"$regex": keyword_pattern, "$options": "i"}},
            {"city": {"$regex": keyword_pattern, "$options": "i"}},
            {"address": {"$regex": keyword_pattern, "$options": "i"}},
            {"state": {"$regex": keyword_pattern, "$options": "i"}},
            {"zip_code": {"$regex": keyword_pattern, "$options": "i"}},
        ]
        cuisine_hints = _derive_cuisine_hints(keywords)
        if cuisine_hints:
            cuisine_pattern = "|".join([re.escape(c) for c in cuisine_hints])
            filt["$or"].append({"cuisine_type": {"$regex": cuisine_pattern, "$options": "i"}})

        # Include restaurants that match keyword in user reviews/comments.
        review_matches = await mongo.reviews.find(
            {"comment": {"$regex": keyword_pattern, "$options": "i"}}
        ).to_list(length=2000)
        restaurant_ids = sorted({r.get("restaurant_id") for r in review_matches if r.get("restaurant_id") is not None})
        if restaurant_ids:
            filt["$or"].append({"_id": {"$in": restaurant_ids}})

    total = await mongo.restaurants.count_documents(filt)
    docs = await mongo.restaurants.find(filt).sort("avg_rating", -1).skip(skip).limit(limit).to_list(length=limit)
    return RestaurantListResponse(total=total, restaurants=[_to_response(d) for d in docs])


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(restaurant_id: int):
    mongo = get_mongo_db()
    restaurant = await mongo.restaurants.find_one({"_id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    return _to_response(restaurant)


@router.put("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(restaurant_id: int, payload: RestaurantUpdate, current_user=Depends(get_current_user)):
    mongo = get_mongo_db()
    restaurant = await mongo.restaurants.find_one({"_id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    if restaurant.get("owner_id") != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not authorized to update this restaurant")

    update_data = payload.model_dump(exclude_unset=True)
    update_data["updated_at"] = now_utc()
    await mongo.restaurants.update_one({"_id": restaurant_id}, {"$set": update_data})
    updated = await mongo.restaurants.find_one({"_id": restaurant_id})
    publish_restaurant_updated(restaurant_id=restaurant_id, name=updated.get("name"), owner_id=current_user.id)
    return _to_response(updated)


@router.delete("/{restaurant_id}", status_code=status.HTTP_200_OK)
async def delete_restaurant(restaurant_id: int, current_user=Depends(get_current_user)):
    mongo = get_mongo_db()
    restaurant = await mongo.restaurants.find_one({"_id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    if restaurant.get("owner_id") != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not authorized to delete this restaurant")
    await mongo.restaurants.delete_one({"_id": restaurant_id})
    return {"message": "Restaurant deleted successfully"}


@router.get("/me/listings", response_model=RestaurantListResponse)
async def get_my_restaurants(current_user=Depends(get_current_user)):
    mongo = get_mongo_db()
    docs = await mongo.restaurants.find({"owner_id": current_user.id}).to_list(length=500)
    return RestaurantListResponse(total=len(docs), restaurants=[_to_response(d) for d in docs])


@router.post("/{restaurant_id}/photos", status_code=status.HTTP_201_CREATED)
async def upload_restaurant_photo(restaurant_id: int, file: UploadFile = File(...), current_user=Depends(get_current_user)):
    mongo = get_mongo_db()
    restaurant = await mongo.restaurants.find_one({"_id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    if restaurant.get("owner_id") != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the restaurant owner can upload photos")

    filename_lower = file.filename.lower()
    allowed_extensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]
    if not any(filename_lower.endswith(ext) for ext in allowed_extensions):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image files are allowed")

    upload_dir = f"uploads/restaurant_photos/{restaurant_id}"
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo_id = await get_next_id(mongo, "restaurant_photos")
    photo_doc = {"_id": photo_id, "restaurant_id": restaurant_id, "photo_url": "/" + file_path.replace("\\", "/"), "created_at": now_utc()}
    await mongo.restaurant_photos.insert_one(photo_doc)
    return {"id": photo_id, "restaurant_id": restaurant_id, "photo_url": photo_doc["photo_url"]}


@router.get("/{restaurant_id}/photos")
async def get_restaurant_photos(restaurant_id: int):
    mongo = get_mongo_db()
    restaurant = await mongo.restaurants.find_one({"_id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    photos = await mongo.restaurant_photos.find({"restaurant_id": restaurant_id}).to_list(length=500)
    return [{"id": p["_id"], "photo_url": p.get("photo_url"), "restaurant_id": p.get("restaurant_id")} for p in photos]


@router.delete("/{restaurant_id}/photos/{photo_id}", status_code=status.HTTP_200_OK)
async def delete_restaurant_photo(restaurant_id: int, photo_id: int, current_user=Depends(get_current_user)):
    mongo = get_mongo_db()
    restaurant = await mongo.restaurants.find_one({"_id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    if restaurant.get("owner_id") != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the restaurant owner can delete photos")

    photo = await mongo.restaurant_photos.find_one({"_id": photo_id, "restaurant_id": restaurant_id})
    if not photo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")
    file_path = photo.get("photo_url", "").lstrip("/")
    if file_path and os.path.exists(file_path):
        os.remove(file_path)
    await mongo.restaurant_photos.delete_one({"_id": photo_id})
    return {"message": "Photo deleted successfully"}
