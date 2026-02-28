from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Favorite(Base):
    __tablename__ = "favorites"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user       = relationship("User", back_populates="favorites")
    restaurant = relationship("Restaurant", back_populates="favorites")