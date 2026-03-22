from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, restaurants, reviews, favorites, owner, ai_assistant
import os

app = FastAPI(title="Yelp Prototype API", version="1.0.0")

# ── CORS — allow React frontend to talk to FastAPI ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

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