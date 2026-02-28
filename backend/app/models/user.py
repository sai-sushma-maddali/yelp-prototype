from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    phone         = Column(String(20), nullable=True)
    about_me      = Column(String(500), nullable=True)
    city          = Column(String(100), nullable=True)
    country       = Column(String(100), nullable=True)
    state         = Column(String(50), nullable=True)
    languages     = Column(String(200), nullable=True)
    gender        = Column(Enum("male", "female", "other", "prefer_not_to_say"), nullable=True)
    profile_pic   = Column(String(255), nullable=True)
    role          = Column(Enum("user", "owner"), default="user", nullable=False)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    reviews       = relationship("Review", back_populates="user")
    favorites     = relationship("Favorite", back_populates="user")
    preferences   = relationship("UserPreference", back_populates="user", uselist=False)
    restaurants   = relationship("Restaurant", back_populates="owner")
    claims        = relationship("RestaurantClaim", back_populates="user")