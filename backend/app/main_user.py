from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users
from app.mongodb import connect_to_mongo, close_mongo_connection

app = FastAPI(title="User API Service", version="1.0.0")

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

app.include_router(auth.router)
app.include_router(users.router)

@app.get("/")
def root():
    return {"service": "User API Service", "status": "running"}