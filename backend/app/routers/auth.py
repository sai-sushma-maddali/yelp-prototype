from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import UserSignup, UserLogin, Token, UserResponse
from app.services.auth import hash_password, verify_password, create_access_token
from app.services.dependencies import get_current_user
from app.services.session_service import create_session, delete_session
from app.services.kafka_producer import publish_user_created
from app.mongodb import get_mongo_db
from app.services.mongo_repo import get_next_id, normalize_doc, now_utc

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserSignup):
    mongo = get_mongo_db()
    existing_user = await mongo.users.find_one({"email": payload.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user_id = await get_next_id(mongo, "users")
    new_user = {
        "_id": user_id,
        "name": payload.name,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "role": payload.role.value if hasattr(payload.role, "value") else payload.role,
        "is_active": True,
        "phone": None,
        "about_me": None,
        "city": None,
        "state": None,
        "country": None,
        "languages": None,
        "gender": None,
        "profile_pic": None,
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    await mongo.users.insert_one(new_user)

    token = create_access_token(data={"sub": str(user_id)})

    # Save session to MongoDB
    await create_session(user_id, token, new_user["role"])

    # Publish to Kafka
    publish_user_created(
        user_id=user_id,
        name=new_user["name"],
        email=new_user["email"],
        role=new_user["role"]
    )

    return Token(
        access_token=token,
        role=new_user["role"],
        user_id=user_id,
        name=new_user["name"]
    )


@router.post("/login", response_model=Token)
async def login(payload: UserLogin):
    mongo = get_mongo_db()
    user = await mongo.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    token = create_access_token(data={"sub": str(user["_id"])})

    # Save session to MongoDB
    await create_session(user["_id"], token, user["role"])

    return Token(
        access_token=token,
        role=user["role"],
        user_id=user["_id"],
        name=user["name"]
    )


@router.post("/logout")
async def logout(current_user=Depends(get_current_user)):
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return normalize_doc({"_id": current_user.id, **current_user.__dict__})