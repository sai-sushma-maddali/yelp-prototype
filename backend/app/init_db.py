from app.database import engine, Base
from app import models  # triggers __init__.py to register all models onto Base

def init():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Done!")

if __name__ == "__main__":
    init()