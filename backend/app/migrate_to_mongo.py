from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.mongodb import connect_to_mongo, get_mongo_db
from app.models.user import User
from app.models.user_preference import UserPreference
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.favorite import Favorite
from app.models.restaurant_photo import RestaurantPhoto
from app.models.restaurant_claim import RestaurantClaim
import asyncio

async def migrate():
    # Connect to MongoDB
    await connect_to_mongo()
    mongo = get_mongo_db()

    # Connect to MySQL
    db: Session = SessionLocal()

    print("Starting migration...")

    # ── 1. Migrate Users ──────────────────────────────────────
    print("Migrating users...")
    users = db.query(User).all()
    if users:
        await mongo.users.drop()
        await mongo.users.insert_many([
            {
                "_id":          u.id,
                "name":         u.name,
                "email":        u.email,
                "password_hash": u.password_hash,
                "phone":        u.phone,
                "about_me":     u.about_me,
                "city":         u.city,
                "state":        u.state,
                "country":      u.country,
                "languages":    u.languages,
                "gender":       u.gender,
                "profile_pic":  u.profile_pic,
                "role":         u.role,
                "is_active":    u.is_active,
                "created_at":   u.created_at,
                "updated_at":   u.updated_at
            }
            for u in users
        ])
        print(f"  Migrated {len(users)} users")

    # ── 2. Migrate User Preferences ───────────────────────────
    print("Migrating user preferences...")
    prefs = db.query(UserPreference).all()
    if prefs:
        await mongo.user_preferences.drop()
        await mongo.user_preferences.insert_many([
            {
                "_id":                  p.id,
                "user_id":              p.user_id,
                "cuisine_preferences":  p.cuisine_preferences,
                "price_range":          p.price_range,
                "preferred_location":   p.preferred_location,
                "search_radius_km":     p.search_radius_km,
                "dietary_needs":        p.dietary_needs,
                "ambiance":             p.ambiance,
                "sort_preference":      p.sort_preference
            }
            for p in prefs
        ])
        print(f"  Migrated {len(prefs)} preferences")

    # ── 3. Migrate Restaurants ────────────────────────────────
    print("Migrating restaurants...")
    restaurants = db.query(Restaurant).all()
    if restaurants:
        await mongo.restaurants.drop()
        await mongo.restaurants.insert_many([
            {
                "_id":          r.id,
                "name":         r.name,
                "cuisine_type": r.cuisine_type,
                "description":  r.description,
                "address":      r.address,
                "city":         r.city,
                "state":        r.state,
                "zip_code":     r.zip_code,
                "phone":        r.phone,
                "email":        r.email,
                "website":      r.website,
                "hours":        r.hours,
                "price_tier":   r.price_tier,
                "amenities":    r.amenities,
                "avg_rating":   r.avg_rating,
                "review_count": r.review_count,
                "is_claimed":   r.is_claimed,
                "owner_id":     r.owner_id,
                "created_at":   r.created_at,
                "updated_at":   r.updated_at
            }
            for r in restaurants
        ])
        print(f"  Migrated {len(restaurants)} restaurants")

    # ── 4. Migrate Reviews ────────────────────────────────────
    print("Migrating reviews...")
    reviews = db.query(Review).all()
    if reviews:
        await mongo.reviews.drop()
        await mongo.reviews.insert_many([
            {
                "_id":            rv.id,
                "user_id":        rv.user_id,
                "restaurant_id":  rv.restaurant_id,
                "rating":         rv.rating,
                "comment":        rv.comment,
                "created_at":     rv.created_at,
                "updated_at":     rv.updated_at
            }
            for rv in reviews
        ])
        print(f"  Migrated {len(reviews)} reviews")

    # ── 5. Migrate Favorites ──────────────────────────────────
    print("Migrating favorites...")
    favorites = db.query(Favorite).all()
    if favorites:
        await mongo.favorites.drop()
        await mongo.favorites.insert_many([
            {
                "_id":            f.id,
                "user_id":        f.user_id,
                "restaurant_id":  f.restaurant_id,
                "created_at":     f.created_at
            }
            for f in favorites
        ])
        print(f"  Migrated {len(favorites)} favorites")

    # ── 6. Migrate Restaurant Photos ──────────────────────────
    print("Migrating restaurant photos...")
    photos = db.query(RestaurantPhoto).all()
    if photos:
        await mongo.restaurant_photos.drop()
        await mongo.restaurant_photos.insert_many([
            {
                "_id":            p.id,
                "restaurant_id":  p.restaurant_id,
                "photo_url":      p.photo_url,
                "created_at":     p.created_at
            }
            for p in photos
        ])
        print(f"  Migrated {len(photos)} photos")

    # ── 7. Migrate Restaurant Claims ──────────────────────────
    print("Migrating restaurant claims...")
    claims = db.query(RestaurantClaim).all()
    if claims:
        await mongo.restaurant_claims.drop()
        await mongo.restaurant_claims.insert_many([
            {
                "_id":            c.id,
                "user_id":        c.user_id,
                "restaurant_id":  c.restaurant_id,
                "status":         c.status,
                "created_at":     c.created_at
            }
            for c in claims
        ])
        print(f"  Migrated {len(claims)} claims")

    # ── 8. Create Sessions Collection ─────────────────────────
    print("Creating sessions collection...")
    await mongo.sessions.drop()
    # Create TTL index — sessions expire after 24 hours
    await mongo.sessions.create_index(
        "expires_at",
        expireAfterSeconds=0
    )
    print("  Sessions collection created with TTL index")

    # ── 9. Create Indexes ─────────────────────────────────────
    print("Creating indexes...")
    await mongo.users.create_index("email", unique=True)
    await mongo.restaurants.create_index("name")
    await mongo.restaurants.create_index("city")
    await mongo.restaurants.create_index("cuisine_type")
    await mongo.reviews.create_index("restaurant_id")
    await mongo.reviews.create_index("user_id")
    await mongo.favorites.create_index("user_id")
    print("  Indexes created")

    db.close()
    print("\nMigration complete!")
    print(f"Collections created: users, user_preferences, restaurants,")
    print(f"reviews, favorites, restaurant_photos, restaurant_claims, sessions")

if __name__ == "__main__":
    asyncio.run(migrate())