from pydantic import BaseModel
from typing import Optional
from enum import Enum

class PriceTierEnum(str, Enum):
    one = "$"
    two = "$$"
    three = "$$$"
    four = "$$$$"

# --- Create Restaurant ---
class RestaurantCreate(BaseModel):
    name: str
    cuisine_type: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    hours: Optional[str] = None        # e.g. '{"mon": "9am-10pm", "tue": "9am-10pm"}'
    price_tier: Optional[PriceTierEnum] = None
    amenities: Optional[str] = None   # e.g. "wifi,outdoor_seating,parking"

# --- Update Restaurant ---
class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    cuisine_type: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    hours: Optional[str] = None
    price_tier: Optional[PriceTierEnum] = None
    amenities: Optional[str] = None

# --- Restaurant Response ---
class RestaurantResponse(BaseModel):
    id: int
    name: str
    cuisine_type: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    hours: Optional[str] = None
    price_tier: Optional[str] = None
    amenities: Optional[str] = None
    avg_rating: float = 0.0
    review_count: int = 0
    is_claimed: bool = False
    owner_id: Optional[int] = None

    class Config:
        from_attributes = True

# --- Restaurant List Response (for search results) ---
class RestaurantListResponse(BaseModel):
    total: int
    restaurants: list[RestaurantResponse]