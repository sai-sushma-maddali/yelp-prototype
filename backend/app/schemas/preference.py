from pydantic import BaseModel
from typing import Optional
from enum import Enum

class PriceRangeEnum(str, Enum):
    one = "$"
    two = "$$"
    three = "$$$"
    four = "$$$$"

class SortPreferenceEnum(str, Enum):
    rating = "rating"
    distance = "distance"
    popularity = "popularity"
    price = "price"

class PreferenceUpdate(BaseModel):
    cuisine_preferences: Optional[str] = None   # e.g. "Italian,Chinese,Mexican"
    price_range: Optional[PriceRangeEnum] = None
    preferred_location: Optional[str] = None
    search_radius_km: Optional[int] = 10
    dietary_needs: Optional[str] = None          # e.g. "vegetarian,halal"
    ambiance: Optional[str] = None               # e.g. "casual,romantic"
    sort_preference: Optional[SortPreferenceEnum] = None

class PreferenceResponse(BaseModel):
    id: int
    user_id: int
    cuisine_preferences: Optional[str] = None
    price_range: Optional[str] = None
    preferred_location: Optional[str] = None
    search_radius_km: Optional[int] = None
    dietary_needs: Optional[str] = None
    ambiance: Optional[str] = None
    sort_preference: Optional[str] = None

    class Config:
        from_attributes = True