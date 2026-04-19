from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import reviews
from app.mongodb import connect_to_mongo, close_mongo_connection
from app.services.kafka_consumer import start_all_workers

app = FastAPI(title="Review API Service", version="1.0.0")

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
    start_all_workers()

@app.on_event("shutdown")
async def shutdown():
    await close_mongo_connection()

app.include_router(reviews.router)

@app.get("/")
def root():
    return {"service": "Review API Service", "status": "running"}