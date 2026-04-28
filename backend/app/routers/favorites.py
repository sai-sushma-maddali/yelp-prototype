from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.favorite import FavoriteResponse
from app.services.dependencies import get_current_user
from app.mongodb import get_mongo_db
from app.services.mongo_repo import get_next_id, normalize_doc, now_utc

router = APIRouter(tags=["Favorites & History"])


@router.post("/restaurants/{restaurant_id}/favorite", status_code=status.HTTP_201_CREATED)
async def add_favorite(restaurant_id: int, current_user=Depends(get_current_user)):
    mongo = get_mongo_db()
    restaurant = await mongo.restaurants.find_one({"_id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    existing = await mongo.favorites.find_one({"user_id": current_user.id, "restaurant_id": restaurant_id})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Restaurant already in favorites")
    fav_id = await get_next_id(mongo, "favorites")
    await mongo.favorites.insert_one({"_id": fav_id, "user_id": current_user.id, "restaurant_id": restaurant_id, "created_at": now_utc()})
    return {"message": "Restaurant added to favorites"}


@router.delete("/restaurants/{restaurant_id}/favorite", status_code=status.HTTP_200_OK)
async def remove_favorite(restaurant_id: int, current_user=Depends(get_current_user)):
    mongo = get_mongo_db()
    favorite = await mongo.favorites.find_one({"user_id": current_user.id, "restaurant_id": restaurant_id})
    if not favorite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not in favorites")
    await mongo.favorites.delete_one({"_id": favorite["_id"]})
    return {"message": "Restaurant removed from favorites"}


@router.get("/users/me/favorites", response_model=List[FavoriteResponse])
async def get_favorites(current_user=Depends(get_current_user)):
    mongo = get_mongo_db()
    favorites = await mongo.favorites.find({"user_id": current_user.id}).to_list(length=1000)
    result = []
    for f in favorites:
        restaurant = await mongo.restaurants.find_one({"_id": f["restaurant_id"]})
        row = normalize_doc(f)
        row["restaurant"] = normalize_doc(restaurant) if restaurant else None
        result.append(FavoriteResponse.model_validate(row))
    return result


@router.get("/users/me/history")
async def get_history(current_user=Depends(get_current_user)):
    mongo = get_mongo_db()
    reviews = await mongo.reviews.find({"user_id": current_user.id}).sort("created_at", -1).to_list(length=1000)
    reviews_history = []
    for review in reviews:
        restaurant = await mongo.restaurants.find_one({"_id": review["restaurant_id"]})
        reviews_history.append({
            "type": "review",
            "review_id": review["_id"],
            "rating": review.get("rating"),
            "comment": review.get("comment"),
            "created_at": review.get("created_at"),
            "restaurant_id": review.get("restaurant_id"),
            "restaurant_name": restaurant.get("name") if restaurant else None,
        })

    restaurants = await mongo.restaurants.find({"owner_id": current_user.id}).sort("created_at", -1).to_list(length=1000)
    restaurants_history = [
        {
            "type": "restaurant_added",
            "restaurant_id": r["_id"],
            "restaurant_name": r.get("name"),
            "cuisine_type": r.get("cuisine_type"),
            "city": r.get("city"),
            "created_at": r.get("created_at"),
        }
        for r in restaurants
    ]

    return {
        "user_id": current_user.id,
        "reviews": reviews_history,
        "restaurants_added": restaurants_history,
        "total_reviews": len(reviews_history),
        "total_restaurants_added": len(restaurants_history),
    }
