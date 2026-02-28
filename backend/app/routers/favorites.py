from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.favorite import Favorite
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.user import User
from app.schemas.favorite import FavoriteResponse
from app.schemas.review import ReviewResponse
from app.schemas.restaurant import RestaurantResponse
from app.services.dependencies import get_current_user

router = APIRouter(tags=["Favorites & History"])


# --- Add to Favorites ---
@router.post(
    "/restaurants/{restaurant_id}/favorite",
    status_code=status.HTTP_201_CREATED
)
def add_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check restaurant exists
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id
    ).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )

    # Check if already favorited
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Restaurant already in favorites"
        )

    favorite = Favorite(
        user_id=current_user.id,
        restaurant_id=restaurant_id
    )
    db.add(favorite)
    db.commit()
    return {"message": "Restaurant added to favorites"}


# --- Remove from Favorites ---
@router.delete(
    "/restaurants/{restaurant_id}/favorite",
    status_code=status.HTTP_200_OK
)
def remove_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.restaurant_id == restaurant_id
    ).first()

    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not in favorites"
        )

    db.delete(favorite)
    db.commit()
    return {"message": "Restaurant removed from favorites"}


# --- Get My Favorites ---
@router.get("/users/me/favorites", response_model=List[FavoriteResponse])
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).all()
    return favorites


# --- Get User History ---
# History = restaurants added by user + reviews written by user
@router.get("/users/me/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Reviews written by user
    reviews = db.query(Review).filter(
        Review.user_id == current_user.id
    ).order_by(Review.created_at.desc()).all()

    reviews_history = []
    for review in reviews:
        restaurant = db.query(Restaurant).filter(
            Restaurant.id == review.restaurant_id
        ).first()
        reviews_history.append({
            "type": "review",
            "review_id": review.id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at,
            "restaurant_id": review.restaurant_id,
            "restaurant_name": restaurant.name if restaurant else None
        })

    # Restaurants added by user
    restaurants = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).order_by(Restaurant.created_at.desc()).all()

    restaurants_history = []
    for r in restaurants:
        restaurants_history.append({
            "type": "restaurant_added",
            "restaurant_id": r.id,
            "restaurant_name": r.name,
            "cuisine_type": r.cuisine_type,
            "city": r.city,
            "created_at": r.created_at
        })

    return {
        "user_id": current_user.id,
        "reviews": reviews_history,
        "restaurants_added": restaurants_history,
        "total_reviews": len(reviews_history),
        "total_restaurants_added": len(restaurants_history)
    }