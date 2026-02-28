from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routers import auth, users, restaurants, reviews, favorites, owner
import os

app = FastAPI(title="Yelp Prototype API", version="1.0.0")

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(restaurants.router)
app.include_router(reviews.router)
app.include_router(favorites.router)
app.include_router(owner.router)

@app.get("/")
def root():
    return {"message": "Yelp Prototype API is running!"}