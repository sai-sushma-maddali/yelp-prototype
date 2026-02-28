from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(200), nullable=False, index=True)
    cuisine_type = Column(String(100), nullable=True)
    description  = Column(Text, nullable=True)
    address      = Column(String(300), nullable=True)
    city         = Column(String(100), nullable=True, index=True)
    state        = Column(String(50), nullable=True)
    zip_code     = Column(String(20), nullable=True)
    phone        = Column(String(20), nullable=True)
    email        = Column(String(100), nullable=True)
    website      = Column(String(200), nullable=True)
    hours        = Column(String(500), nullable=True)  # JSON string e.g. {"mon": "9am-10pm"}
    price_tier   = Column(Enum("$", "$$", "$$$", "$$$$"), nullable=True)
    amenities    = Column(String(300), nullable=True)  # e.g. "wifi,outdoor_seating"
    avg_rating   = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    is_claimed   = Column(Boolean, default=False)
    owner_id     = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner    = relationship("User", back_populates="restaurants")
    reviews  = relationship("Review", back_populates="restaurant")
    photos   = relationship("RestaurantPhoto", back_populates="restaurant")
    favorites = relationship("Favorite", back_populates="restaurant")
    claims   = relationship("RestaurantClaim", back_populates="restaurant")