from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.owner import ClaimRequest, ClaimResponse
from app.schemas.restaurant import RestaurantResponse, RestaurantUpdate
from app.schemas.review import ReviewResponse
from app.services.dependencies import get_current_owner
from app.mongodb import get_mongo_db
from app.services.mongo_repo import get_next_id, normalize_doc, now_utc

router = APIRouter(prefix="/owner", tags=["Restaurant Owner"])


@router.get("/restaurants", response_model=List[RestaurantResponse])
async def get_owner_restaurants(current_user=Depends(get_current_owner)):
    mongo = get_mongo_db()
    restaurants = await mongo.restaurants.find({"owner_id": current_user.id}).to_list(length=1000)
    return [RestaurantResponse.model_validate(normalize_doc(r)) for r in restaurants]


@router.put("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
async def update_owner_restaurant(restaurant_id: int, payload: RestaurantUpdate, current_user=Depends(get_current_owner)):
    mongo = get_mongo_db()
    restaurant = await mongo.restaurants.find_one({"_id": restaurant_id, "owner_id": current_user.id})
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found or you don't own it")
    update_data = payload.model_dump(exclude_unset=True)
    update_data["updated_at"] = now_utc()
    await mongo.restaurants.update_one({"_id": restaurant_id}, {"$set": update_data})
    updated = await mongo.restaurants.find_one({"_id": restaurant_id})
    return RestaurantResponse.model_validate(normalize_doc(updated))


@router.post("/claim", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
async def claim_restaurant(payload: ClaimRequest, current_user=Depends(get_current_owner)):
    mongo = get_mongo_db()
    restaurant = await mongo.restaurants.find_one({"_id": payload.restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    if restaurant.get("is_claimed") and restaurant.get("owner_id") != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This restaurant has already been claimed by another owner")

    existing = await mongo.restaurant_claims.find_one({"user_id": current_user.id, "restaurant_id": payload.restaurant_id, "status": "pending"})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You already have a pending claim for this restaurant")

    claim_id = await get_next_id(mongo, "restaurant_claims")
    claim = {"_id": claim_id, "user_id": current_user.id, "restaurant_id": payload.restaurant_id, "status": "approved", "created_at": now_utc()}
    await mongo.restaurant_claims.insert_one(claim)
    await mongo.restaurants.update_one({"_id": payload.restaurant_id}, {"$set": {"is_claimed": True, "owner_id": current_user.id, "updated_at": now_utc()}})
    return ClaimResponse.model_validate(normalize_doc(claim))


@router.get("/restaurants/{restaurant_id}/reviews", response_model=List[ReviewResponse])
async def get_restaurant_reviews(restaurant_id: int, current_user=Depends(get_current_owner)):
    mongo = get_mongo_db()
    restaurant = await mongo.restaurants.find_one({"_id": restaurant_id, "owner_id": current_user.id})
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found or you don't own it")
    reviews = await mongo.reviews.find({"restaurant_id": restaurant_id}).to_list(length=1000)
    result = []
    for review in reviews:
        user = await mongo.users.find_one({"_id": review["user_id"]})
        row = normalize_doc(review)
        row["user_name"] = user.get("name") if user else None
        result.append(ReviewResponse.model_validate(row))
    return result


@router.get("/dashboard/{restaurant_id}")
async def get_owner_dashboard(restaurant_id: int, current_user=Depends(get_current_owner)):
    mongo = get_mongo_db()
    restaurant = await mongo.restaurants.find_one({"_id": restaurant_id, "owner_id": current_user.id})
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found or you don't own it")
    all_reviews = await mongo.reviews.find({"restaurant_id": restaurant_id}).sort("created_at", -1).to_list(length=5000)
    distribution = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
    for review in all_reviews:
        rating = int(review.get("rating", 0))
        if 1 <= rating <= 5:
            distribution[str(rating)] += 1
    total = len(all_reviews)
    positive = sum(1 for r in all_reviews if r.get("rating", 0) >= 4)
    neutral = sum(1 for r in all_reviews if r.get("rating", 0) == 3)
    negative = sum(1 for r in all_reviews if r.get("rating", 0) <= 2)
    recent = []
    for review in all_reviews[:5]:
        user = await mongo.users.find_one({"_id": review["user_id"]})
        recent.append({"review_id": review["_id"], "user_name": user.get("name") if user else "Anonymous", "rating": review.get("rating"), "comment": review.get("comment"), "created_at": review.get("created_at")})
    return {
        "restaurant_id": restaurant["_id"],
        "restaurant_name": restaurant.get("name"),
        "total_reviews": total,
        "avg_rating": restaurant.get("avg_rating", 0.0),
        "rating_distribution": distribution,
        "sentiment": {
            "positive": positive,
            "neutral": neutral,
            "negative": negative,
            "positive_pct": round(positive / total * 100, 1) if total > 0 else 0,
            "negative_pct": round(negative / total * 100, 1) if total > 0 else 0,
        },
        "recent_reviews": recent,
    }


@router.get("/claims", response_model=List[ClaimResponse])
async def get_my_claims(current_user=Depends(get_current_owner)):
    mongo = get_mongo_db()
    claims = await mongo.restaurant_claims.find({"user_id": current_user.id}).to_list(length=1000)
    return [ClaimResponse.model_validate(normalize_doc(c)) for c in claims]
