from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.schemas.user import UserProfileUpdate, UserResponse
from app.schemas.preference import PreferenceUpdate, PreferenceResponse
from app.services.dependencies import get_current_user
from app.mongodb import get_mongo_db
from app.services.mongo_repo import normalize_doc, get_next_id, now_utc
import shutil
import os
import uuid

router = APIRouter(prefix="/users", tags=["Users"])

UPLOAD_DIR = "uploads/profile_pics"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# --- Get Profile ---
@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user=Depends(get_current_user)):
    return normalize_doc({"_id": current_user.id, **current_user.__dict__})


# --- Update Profile ---
@router.put("/profile", response_model=UserResponse)
async def update_profile(
    payload: UserProfileUpdate,
    current_user=Depends(get_current_user)
):
    mongo = get_mongo_db()
    # Only update fields that were actually sent
    update_data = payload.model_dump(exclude_unset=True)
    if update_data:
        update_data["updated_at"] = now_utc()
        await mongo.users.update_one(
            {"_id": current_user.id},
            {"$set": update_data}
        )
    updated_user = await mongo.users.find_one({"_id": current_user.id})
    return normalize_doc(updated_user)


# --- Upload Profile Picture ---
@router.post("/profile/picture", response_model=UserResponse)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    mongo = get_mongo_db()
    # Print for debugging
    print(f"Uploaded file: {file.filename}, content_type: {file.content_type}")

    # Validate by file extension (more reliable than content_type)
    filename_lower = file.filename.lower()
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']
    if not any(filename_lower.endswith(ext) for ext in allowed_extensions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, WebP, GIF and AVIF images are allowed"
        )

    # Generate unique filename
    ext = file.filename.split(".")[-1].lower()
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
    await mongo.users.update_one(
        {"_id": current_user.id},
        {"$set": {"profile_pic": "/" + file_path.replace("\\", "/"), "updated_at": now_utc()}}
    )
    updated_user = await mongo.users.find_one({"_id": current_user.id})
    return normalize_doc(updated_user)


# --- Get Preferences ---
@router.get("/preferences", response_model=PreferenceResponse)
async def get_preferences(
    current_user=Depends(get_current_user)
):
    mongo = get_mongo_db()
    prefs = await mongo.user_preferences.find_one({"user_id": current_user.id})

    if not prefs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No preferences found. Please set your preferences first."
        )
    return normalize_doc(prefs)


# --- Set / Update Preferences ---
@router.put("/preferences", response_model=PreferenceResponse)
async def update_preferences(
    payload: PreferenceUpdate,
    current_user=Depends(get_current_user)
):
    mongo = get_mongo_db()
    prefs = await mongo.user_preferences.find_one({"user_id": current_user.id})
    update_data = payload.model_dump(exclude_unset=True)

    if not prefs:
        pref_id = await get_next_id(mongo, "user_preferences")
        prefs = {
            "_id": pref_id,
            "user_id": current_user.id,
            **update_data,
        }
        await mongo.user_preferences.insert_one(prefs)
    else:
        await mongo.user_preferences.update_one(
            {"_id": prefs["_id"]},
            {"$set": update_data}
        )
        prefs = await mongo.user_preferences.find_one({"_id": prefs["_id"]})

    return normalize_doc(prefs)