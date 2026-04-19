from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB   = os.getenv("MONGO_DB", "yelp_db_mongo")

client = None
db     = None

async def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db     = client[MONGO_DB]
    print(f"Connected to MongoDB: {MONGO_DB}")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")

def get_mongo_db():
    return db