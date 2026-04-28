from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.auth import decode_access_token
from app.mongodb import get_mongo_db
from types import SimpleNamespace

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    mongo = get_mongo_db()
    if mongo is None:
        raise credentials_exception

    user = await mongo.users.find_one({"_id": int(user_id)})
    if user is None:
        raise credentials_exception

    user["id"] = user.pop("_id")
    return SimpleNamespace(**user)

async def get_current_owner(current_user=Depends(get_current_user)):
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only restaurant owners can perform this action"
        )
    return current_user