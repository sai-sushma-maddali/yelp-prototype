from fastapi import FastAPI
from fastapi import Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, restaurants, reviews, favorites, owner, ai_assistant
from app.mongodb import connect_to_mongo, close_mongo_connection
from app.services.kafka_consumer import start_all_workers
import os

app = FastAPI(title="Yelp Prototype API", version="1.0.0")

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://yelp-lab2-seera-frontend-72664250.s3-website-us-east-1.amazonaws.com",
    "http://yelp-lab2-seera-frontend-72664250.s3-website.us-east-1.amazonaws.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    allow_private_network=True,
)


@app.middleware("http")
async def private_network_cors(request: Request, call_next):
    response = await call_next(request)
    # Needed by modern browsers when a public origin calls localhost/private-network APIs.
    if request.headers.get("access-control-request-private-network") == "true":
        response.headers["Access-Control-Allow-Private-Network"] = "true"
    return response

@app.on_event("startup")
async def startup_db():
    await connect_to_mongo()
    # Start Kafka worker services in background (skip in pytest / CI without broker)
    if os.getenv("SKIP_KAFKA_WORKERS", "").lower() not in ("1", "true", "yes"):
        start_all_workers()

@app.on_event("shutdown")
async def shutdown_db():
    await close_mongo_connection()

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(restaurants.router)
app.include_router(reviews.router)
app.include_router(favorites.router)
app.include_router(owner.router)
app.include_router(ai_assistant.router)

@app.get("/")
def root():
    return {"message": "Yelp Prototype API is running!"}