from pydantic import BaseModel
from datetime import datetime
from app.schemas.restaurant import RestaurantResponse

class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    created_at: datetime
    restaurant: RestaurantResponse

    class Config:
        from_attributes = True