from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.user_preference import UserPreference
from app.schemas.user import UserProfileUpdate, UserResponse
from app.schemas.preference import PreferenceUpdate, PreferenceResponse
from app.services.dependencies import get_current_user
import shutil
import os
import uuid

router = APIRouter(prefix="/users", tags=["Users"])

UPLOAD_DIR = "uploads/profile_pics"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# --- Get Profile ---
@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


# --- Update Profile ---
@router.put("/profile", response_model=UserResponse)
def update_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only update fields that were actually sent
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


# --- Upload Profile Picture ---
@router.post("/profile/picture", response_model=UserResponse)
def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, and WebP images are allowed"
        )

    # Generate unique filename
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Delete old profile pic if exists
    if current_user.profile_pic:
        old_path = current_user.profile_pic.lstrip("/")
        if os.path.exists(old_path):
            os.remove(old_path)

    # Save path to DB
    current_user.profile_pic = "/" + file_path.replace("\\", "/")
    db.commit()
    db.refresh(current_user)
    return current_user


# --- Get Preferences ---
@router.get("/preferences", response_model=PreferenceResponse)
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prefs = db.query(UserPreference).filter(
        UserPreference.user_id == current_user.id
    ).first()

    if not prefs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No preferences found. Please set your preferences first."
        )
    return prefs


# --- Set / Update Preferences ---
@router.put("/preferences", response_model=PreferenceResponse)
def update_preferences(
    payload: PreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prefs = db.query(UserPreference).filter(
        UserPreference.user_id == current_user.id
    ).first()

    if not prefs:
        # Create new preferences if none exist
        prefs = UserPreference(user_id=current_user.id)
        db.add(prefs)

    # Update only fields that were sent
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prefs, field, value)

    db.commit()
    db.refresh(prefs)
    return prefs