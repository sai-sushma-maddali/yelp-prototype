from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id                  = Column(Integer, primary_key=True, index=True)
    user_id             = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    cuisine_preferences = Column(String(500), nullable=True)   # comma-separated e.g. "Italian,Chinese"
    price_range         = Column(Enum("$", "$$", "$$$", "$$$$"), nullable=True)
    preferred_location  = Column(String(200), nullable=True)
    search_radius_km    = Column(Integer, default=10)
    dietary_needs       = Column(String(300), nullable=True)   # e.g. "vegetarian,gluten-free"
    ambiance            = Column(String(300), nullable=True)   # e.g. "casual,fine dining"
    sort_preference     = Column(Enum("rating", "distance", "popularity", "price"), default="rating")

    # Relationship
    user = relationship("User", back_populates="preferences")