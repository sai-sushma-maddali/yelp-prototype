from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ReviewPhoto(Base):
    __tablename__ = "review_photos"

    id         = Column(Integer, primary_key=True, index=True)
    review_id  = Column(Integer, ForeignKey("reviews.id"), nullable=False)
    photo_url  = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    review = relationship("Review", back_populates="photos")