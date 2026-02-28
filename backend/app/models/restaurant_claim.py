from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class RestaurantClaim(Base):
    __tablename__ = "restaurant_claims"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    status        = Column(Enum("pending", "approved", "rejected"), default="pending")
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    user       = relationship("User", back_populates="claims")
    restaurant = relationship("Restaurant", back_populates="claims")