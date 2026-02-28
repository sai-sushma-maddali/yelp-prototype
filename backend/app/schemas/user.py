from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from enum import Enum

class RoleEnum(str, Enum):
    user = "user"
    owner = "owner"

class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    other = "other"
    prefer_not_to_say = "prefer_not_to_say"

# --- Signup ---
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.user

    @field_validator("password")
    @classmethod
    def password_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        if len(v) > 72:
            raise ValueError("Password must not exceed 72 characters")
        return v

# --- Login ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- Token Response ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str

# --- Update Profile ---
class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    about_me: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    languages: Optional[str] = None
    gender: Optional[GenderEnum] = None

# --- User Response (safe - no password) ---
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    about_me: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    languages: Optional[str] = None
    gender: Optional[str] = None
    profile_pic: Optional[str] = None

    class Config:
        from_attributes = True