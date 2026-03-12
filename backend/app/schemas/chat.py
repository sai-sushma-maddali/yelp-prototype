from pydantic import BaseModel
from typing import Optional

class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: list[ChatMessage] = []

class RestaurantCard(BaseModel):
    id: int
    name: str
    cuisine_type: Optional[str] = None
    city: Optional[str] = None
    price_tier: Optional[str] = None
    avg_rating: float = 0.0
    review_count: int = 0
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    restaurants: list[RestaurantCard] = []
    filters_used: dict = {}