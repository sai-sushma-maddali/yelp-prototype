from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.review import Review
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse
from app.services.dependencies import get_current_user
from app.services.kafka_producer import (
    publish_review_created,
    publish_review_updated,
    publish_review_deleted
)
from typing import List

router = APIRouter(tags=["Reviews"])


# --- Create Review ---
@router.post(
    "/restaurants/{restaurant_id}/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED
)
def create_review(
    restaurant_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )

    existing_review = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.restaurant_id == restaurant_id
    ).first()
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this restaurant"
        )

    review = Review(
        user_id=current_user.id,
        restaurant_id=restaurant_id,
        rating=payload.rating,
        comment=payload.comment
    )
    db.add(review)

    all_reviews = db.query(Review).filter(
        Review.restaurant_id == restaurant_id
    ).all()
    new_count = len(all_reviews) + 1
    new_avg = (
        sum(r.rating for r in all_reviews) + payload.rating
    ) / new_count

    restaurant.review_count = new_count
    restaurant.avg_rating = round(new_avg, 2)

    db.commit()
    db.refresh(review)

    # Publish to Kafka
    publish_review_created(
        review_id=review.id,
        user_id=current_user.id,
        restaurant_id=restaurant_id,
        rating=payload.rating,
        comment=payload.comment
    )

    response = ReviewResponse.model_validate(review)
    response.user_name = current_user.name
    return response


# --- Get All Reviews for a Restaurant ---
@router.get(
    "/restaurants/{restaurant_id}/reviews",
    response_model=List[ReviewResponse]
)
def get_reviews(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )

    reviews = db.query(Review).filter(
        Review.restaurant_id == restaurant_id
    ).all()

    result = []
    for review in reviews:
        response = ReviewResponse.model_validate(review)
        response.user_name = review.user.name if review.user else None
        result.append(response)

    return result


# --- Update Review (own only) ---
@router.put(
    "/restaurants/{restaurant_id}/reviews/{review_id}",
    response_model=ReviewResponse
)
def update_review(
    restaurant_id: int,
    review_id: int,
    payload: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.restaurant_id == restaurant_id
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own reviews"
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(review, field, value)

    db.commit()

    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()
    all_reviews = db.query(Review).filter(
        Review.restaurant_id == restaurant_id
    ).all()
    if all_reviews:
        restaurant.avg_rating = round(
            sum(r.rating for r in all_reviews) / len(all_reviews), 2
        )
    db.commit()
    db.refresh(review)

    # Publish to Kafka
    publish_review_updated(
        review_id=review.id,
        user_id=current_user.id,
        restaurant_id=restaurant_id,
        rating=review.rating,
        comment=review.comment
    )

    response = ReviewResponse.model_validate(review)
    response.user_name = current_user.name
    return response


# --- Delete Review (own only) ---
@router.delete(
    "/restaurants/{restaurant_id}/reviews/{review_id}",
    status_code=status.HTTP_200_OK
)
def delete_review(
    restaurant_id: int,
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.restaurant_id == restaurant_id
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reviews"
        )

    db.delete(review)

    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()
    remaining_reviews = db.query(Review).filter(
        Review.restaurant_id == restaurant_id,
        Review.id != review_id
    ).all()

    restaurant.review_count = len(remaining_reviews)
    restaurant.avg_rating = round(
        sum(r.rating for r in remaining_reviews) / len(remaining_reviews), 2
    ) if remaining_reviews else 0.0

    db.commit()

    # Publish to Kafka
    publish_review_deleted(
        review_id=review_id,
        restaurant_id=restaurant_id
    )
    return {"message": "Review deleted successfully"}


# --- Get My Reviews ---
@router.get("/users/me/reviews", response_model=List[ReviewResponse])
def get_my_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reviews = db.query(Review).filter(
        Review.user_id == current_user.id
    ).all()

    result = []
    for review in reviews:
        response = ReviewResponse.model_validate(review)
        response.user_name = current_user.name
        result.append(response)

    return result