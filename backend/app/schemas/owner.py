from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ClaimRequest(BaseModel):
    restaurant_id: int
    message: Optional[str] = None  # optional reason for claiming

class ClaimResponse(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class OwnerDashboardResponse(BaseModel):
    restaurant_id: int
    restaurant_name: str
    total_reviews: int
    avg_rating: float
    recent_reviews: list
    rating_distribution: dict  # e.g. {"1": 0, "2": 1, "3": 2, "4": 5, "5": 10}