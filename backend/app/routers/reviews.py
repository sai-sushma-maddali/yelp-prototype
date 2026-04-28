from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse
from app.services.dependencies import get_current_user
from app.services.kafka_producer import publish_review_created, publish_review_updated, publish_review_deleted
from app.mongodb import get_mongo_db
from app.services.mongo_repo import get_next_id, normalize_doc, now_utc
from typing import List

router = APIRouter(tags=["Reviews"])


async def _recompute_restaurant_rating(mongo, restaurant_id: int):
    reviews = await mongo.reviews.find({"restaurant_id": restaurant_id}).to_list(length=5000)
    count = len(reviews)
    avg = round(sum(r.get("rating", 0) for r in reviews) / count, 2) if count else 0.0
    await mongo.restaurants.update_one({"_id": restaurant_id}, {"$set": {"review_count": count, "avg_rating": avg, "updated_at": now_utc()}})


def _to_review_response(doc: dict, user_name: str | None = None):
    data = normalize_doc(doc)
    data["user_name"] = user_name
    return ReviewResponse.model_validate(data)


@router.post("/restaurants/{restaurant_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(restaurant_id: int, payload: ReviewCreate, current_user=Depends(get_current_user)):
    mongo = get_mongo_db()
    restaurant = await mongo.restaurants.find_one({"_id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")

    existing = await mongo.reviews.find_one({"user_id": current_user.id, "restaurant_id": restaurant_id})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already reviewed this restaurant")

    review_id = await get_next_id(mongo, "reviews")
    doc = {
        "_id": review_id,
        "user_id": current_user.id,
        "restaurant_id": restaurant_id,
        "rating": payload.rating,
        "comment": payload.comment,
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    await mongo.reviews.insert_one(doc)
    await _recompute_restaurant_rating(mongo, restaurant_id)
    publish_review_created(review_id=review_id, user_id=current_user.id, restaurant_id=restaurant_id, rating=payload.rating, comment=payload.comment)
    return _to_review_response(doc, current_user.name)


@router.get("/restaurants/{restaurant_id}/reviews", response_model=List[ReviewResponse])
async def get_reviews(restaurant_id: int):
    mongo = get_mongo_db()
    restaurant = await mongo.restaurants.find_one({"_id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    reviews = await mongo.reviews.find({"restaurant_id": restaurant_id}).to_list(length=1000)
    result = []
    for review in reviews:
        user = await mongo.users.find_one({"_id": review["user_id"]})
        result.append(_to_review_response(review, user.get("name") if user else None))
    return result


@router.put("/restaurants/{restaurant_id}/reviews/{review_id}", response_model=ReviewResponse)
async def update_review(restaurant_id: int, review_id: int, payload: ReviewUpdate, current_user=Depends(get_current_user)):
    mongo = get_mongo_db()
    review = await mongo.reviews.find_one({"_id": review_id, "restaurant_id": restaurant_id})
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if review.get("user_id") != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own reviews")

    update_data = payload.model_dump(exclude_unset=True)
    update_data["updated_at"] = now_utc()
    await mongo.reviews.update_one({"_id": review_id}, {"$set": update_data})
    updated = await mongo.reviews.find_one({"_id": review_id})
    await _recompute_restaurant_rating(mongo, restaurant_id)
    publish_review_updated(review_id=review_id, user_id=current_user.id, restaurant_id=restaurant_id, rating=updated["rating"], comment=updated.get("comment"))
    return _to_review_response(updated, current_user.name)


@router.delete("/restaurants/{restaurant_id}/reviews/{review_id}", status_code=status.HTTP_200_OK)
async def delete_review(restaurant_id: int, review_id: int, current_user=Depends(get_current_user)):
    mongo = get_mongo_db()
    review = await mongo.reviews.find_one({"_id": review_id, "restaurant_id": restaurant_id})
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if review.get("user_id") != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own reviews")
    await mongo.reviews.delete_one({"_id": review_id})
    await _recompute_restaurant_rating(mongo, restaurant_id)
    publish_review_deleted(review_id=review_id, restaurant_id=restaurant_id)
    return {"message": "Review deleted successfully"}


@router.get("/users/me/reviews", response_model=List[ReviewResponse])
async def get_my_reviews(current_user=Depends(get_current_user)):
    mongo = get_mongo_db()
    reviews = await mongo.reviews.find({"user_id": current_user.id}).to_list(length=1000)
    return [_to_review_response(r, current_user.name) for r in reviews]
