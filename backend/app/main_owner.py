from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import owner, favorites
from app.mongodb import connect_to_mongo, close_mongo_connection

app = FastAPI(title="Restaurant Owner Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown():
    await close_mongo_connection()

app.include_router(owner.router)
app.include_router(favorites.router)

@app.get("/")
def root():
    return {"service": "Restaurant Owner Service", "status": "running"}