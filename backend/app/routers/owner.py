from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.user import User
from app.models.restaurant_claim import RestaurantClaim
from app.schemas.owner import ClaimRequest, ClaimResponse, OwnerDashboardResponse
from app.schemas.restaurant import RestaurantResponse, RestaurantUpdate
from app.schemas.review import ReviewResponse
from app.services.dependencies import get_current_user, get_current_owner

router = APIRouter(prefix="/owner", tags=["Restaurant Owner"])


# --- Get Owner's Restaurants ---
@router.get("/restaurants", response_model=List[RestaurantResponse])
def get_owner_restaurants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner)
):
    restaurants = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).all()
    return restaurants


# --- Update Owner's Restaurant Profile ---
@router.put("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
def update_owner_restaurant(
    restaurant_id: int,
    payload: RestaurantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner)
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found or you don't own it"
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(restaurant, field, value)

    db.commit()
    db.refresh(restaurant)
    return restaurant


# --- Claim a Restaurant ---
@router.post("/claim", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
def claim_restaurant(
    payload: ClaimRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner)
):
    # Check restaurant exists
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == payload.restaurant_id
    ).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )

    # Check if already claimed by someone else
    if restaurant.is_claimed and restaurant.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This restaurant has already been claimed by another owner"
        )

    # Check if this owner already has a pending claim
    existing_claim = db.query(RestaurantClaim).filter(
        RestaurantClaim.user_id == current_user.id,
        RestaurantClaim.restaurant_id == payload.restaurant_id,
        RestaurantClaim.status == "pending"
    ).first()
    if existing_claim:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending claim for this restaurant"
        )

    # Create claim and auto-approve for simplicity
    claim = RestaurantClaim(
        user_id=current_user.id,
        restaurant_id=payload.restaurant_id,
        status="approved"
    )
    db.add(claim)

    # Update restaurant ownership
    restaurant.is_claimed = True
    restaurant.owner_id = current_user.id

    db.commit()
    db.refresh(claim)
    return claim


# --- View Reviews for Owner's Restaurant (read-only) ---
@router.get("/restaurants/{restaurant_id}/reviews", response_model=List[ReviewResponse])
def get_restaurant_reviews(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner)
):
    # Verify ownership
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found or you don't own it"
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


# --- Owner Dashboard ---
@router.get("/dashboard/{restaurant_id}")
def get_owner_dashboard(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner)
):
    # Verify ownership
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_user.id
    ).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found or you don't own it"
        )

    # Get all reviews
    all_reviews = db.query(Review).filter(
        Review.restaurant_id == restaurant_id
    ).order_by(Review.created_at.desc()).all()

    # Rating distribution
    distribution = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
    for review in all_reviews:
        distribution[str(review.rating)] += 1

    # Recent 5 reviews
    recent_reviews = []
    for review in all_reviews[:5]:
        recent_reviews.append({
            "review_id": review.id,
            "user_name": review.user.name if review.user else "Anonymous",
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at
        })

    # Sentiment summary
    total = len(all_reviews)
    positive = sum(1 for r in all_reviews if r.rating >= 4)
    neutral = sum(1 for r in all_reviews if r.rating == 3)
    negative = sum(1 for r in all_reviews if r.rating <= 2)

    return {
        "restaurant_id": restaurant.id,
        "restaurant_name": restaurant.name,
        "total_reviews": total,
        "avg_rating": restaurant.avg_rating,
        "rating_distribution": distribution,
        "sentiment": {
            "positive": positive,
            "neutral": neutral,
            "negative": negative,
            "positive_pct": round(positive / total * 100, 1) if total > 0 else 0,
            "negative_pct": round(negative / total * 100, 1) if total > 0 else 0
        },
        "recent_reviews": recent_reviews
    }


# --- Get My Claims ---
@router.get("/claims", response_model=List[ClaimResponse])
def get_my_claims(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner)
):
    claims = db.query(RestaurantClaim).filter(
        RestaurantClaim.user_id == current_user.id
    ).all()
    return claims