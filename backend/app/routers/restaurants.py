from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from app.database import get_db
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.restaurant import (
    RestaurantCreate, RestaurantUpdate,
    RestaurantResponse, RestaurantListResponse
)
from app.services.dependencies import get_current_user

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


# --- Create Restaurant ---
@router.post("", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
def create_restaurant(
    payload: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = Restaurant(
        **payload.model_dump(),
        owner_id=current_user.id
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


# --- List / Search Restaurants ---
@router.get("", response_model=RestaurantListResponse)
def list_restaurants(
    name: Optional[str] = Query(None, description="Search by restaurant name"),
    cuisine_type: Optional[str] = Query(None, description="Filter by cuisine type"),
    city: Optional[str] = Query(None, description="Filter by city"),
    zip_code: Optional[str] = Query(None, description="Filter by zip code"),
    price_tier: Optional[str] = Query(None, description="Filter by price tier e.g. $, $$"),
    keywords: Optional[str] = Query(None, description="Search in description and amenities"),
    skip: int = Query(0, description="Pagination offset"),
    limit: int = Query(10, description="Number of results per page"),
    db: Session = Depends(get_db)
):
    query = db.query(Restaurant)

    # Apply filters
    if name:
        query = query.filter(Restaurant.name.ilike(f"%{name}%"))
    if cuisine_type:
        query = query.filter(Restaurant.cuisine_type.ilike(f"%{cuisine_type}%"))
    if city:
        query = query.filter(Restaurant.city.ilike(f"%{city}%"))
    if zip_code:
        query = query.filter(Restaurant.zip_code == zip_code)
    if price_tier:
        query = query.filter(Restaurant.price_tier == price_tier)
    if keywords:
        query = query.filter(
            or_(
                Restaurant.description.ilike(f"%{keywords}%"),
                Restaurant.amenities.ilike(f"%{keywords}%"),
                Restaurant.cuisine_type.ilike(f"%{keywords}%")
            )
        )

    total = query.count()
    restaurants = query.offset(skip).limit(limit).all()

    return RestaurantListResponse(total=total, restaurants=restaurants)


# --- Get Restaurant by ID ---
@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(
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
    return restaurant


# --- Update Restaurant ---
@router.put("/{restaurant_id}", response_model=RestaurantResponse)
def update_restaurant(
    restaurant_id: int,
    payload: RestaurantUpdate,
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

    # Only owner or the user who created it can update
    if restaurant.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this restaurant"
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(restaurant, field, value)

    db.commit()
    db.refresh(restaurant)
    return restaurant


# --- Delete Restaurant ---
@router.delete("/{restaurant_id}", status_code=status.HTTP_200_OK)
def delete_restaurant(
    restaurant_id: int,
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

    # Only the creator can delete
    if restaurant.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this restaurant"
        )

    db.delete(restaurant)
    db.commit()
    return {"message": "Restaurant deleted successfully"}


# --- Get My Restaurants ---
@router.get("/me/listings", response_model=RestaurantListResponse)
def get_my_restaurants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurants = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).all()
    return RestaurantListResponse(total=len(restaurants), restaurants=restaurants)