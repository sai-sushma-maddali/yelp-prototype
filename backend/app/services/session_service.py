from datetime import datetime, timedelta
from app.mongodb import get_mongo_db
import uuid

async def create_session(user_id: int, token: str, role: str):
    mongo = get_mongo_db()
    session = {
        "_id":        str(uuid.uuid4()),
        "user_id":    user_id,
        "token":      token,
        "role":       role,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=1440)
    }
    await mongo.sessions.insert_one(session)
    return session

async def get_session(token: str):
    mongo = get_mongo_db()
    session = await mongo.sessions.find_one({"token": token})
    return session

async def delete_session(token: str):
    mongo = get_mongo_db()
    await mongo.sessions.delete_one({"token": token})