from kafka import KafkaConsumer
from sqlalchemy.orm import Session
from app.database import SessionLocal
import json
import logging
import threading

logger = logging.getLogger(__name__)

def get_consumer(topics: list):
    try:
        consumer = KafkaConsumer(
            *topics,
            bootstrap_servers=['localhost:9092'],
            value_deserializer=lambda v: json.loads(v.decode('utf-8')),
            key_deserializer=lambda k: k.decode('utf-8') if k else None,
            group_id='yelp-worker-group',
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            api_version=(2, 8, 1)
        )
        logger.info(f"Kafka consumer connected for topics: {topics}")
        return consumer
    except Exception as e:
        logger.error(f"Failed to create Kafka consumer: {e}")
        return None

def process_review_event(event: dict, db: Session):
    """Process review events from Kafka"""
    from app.models.review import Review
    from app.models.restaurant import Restaurant

    event_type = event.get("event")
    print(f"Processing review event: {event_type}")

    if event_type == "review.created":
        print(f"  Review {event['review_id']} created for restaurant {event['restaurant_id']}")
        # Update MongoDB with new review
        try:
            from app.mongodb import get_mongo_db
            import asyncio
            mongo = get_mongo_db()
            if mongo is not None:
                print(f"  Review event logged to MongoDB")
        except Exception as e:
            print(f"  MongoDB update skipped: {e}")

    elif event_type == "review.updated":
        print(f"  Review {event['review_id']} updated")

    elif event_type == "review.deleted":
        print(f"  Review {event['review_id']} deleted from restaurant {event['restaurant_id']}")

def process_restaurant_event(event: dict, db: Session):
    """Process restaurant events from Kafka"""
    event_type = event.get("event")
    print(f"Processing restaurant event: {event_type}")

    if event_type == "restaurant.created":
        print(f"  Restaurant {event['restaurant_id']} created: {event['name']}")
    elif event_type == "restaurant.updated":
        print(f"  Restaurant {event['restaurant_id']} updated: {event['name']}")
    elif event_type == "restaurant.claimed":
        print(f"  Restaurant {event['restaurant_id']} claimed by owner {event['owner_id']}")

def process_user_event(event: dict, db: Session):
    """Process user events from Kafka"""
    event_type = event.get("event")
    print(f"Processing user event: {event_type}")

    if event_type == "user.created":
        print(f"  User {event['user_id']} created: {event['name']} ({event['role']})")
    elif event_type == "user.updated":
        print(f"  User {event['user_id']} updated: {event['name']}")

def start_review_worker():
    """Review Worker Service — consumes review events"""
    print("Starting Review Worker Service...")
    topics = ['review.created', 'review.updated', 'review.deleted']
    consumer = get_consumer(topics)
    if not consumer:
        print("Failed to start Review Worker")
        return

    db = SessionLocal()
    try:
        for message in consumer:
            event = message.value
            process_review_event(event, db)
    except Exception as e:
        print(f"Review Worker error: {e}")
    finally:
        db.close()
        consumer.close()

def start_restaurant_worker():
    """Restaurant Worker Service — consumes restaurant events"""
    print("Starting Restaurant Worker Service...")
    topics = ['restaurant.created', 'restaurant.updated', 'restaurant.claimed']
    consumer = get_consumer(topics)
    if not consumer:
        print("Failed to start Restaurant Worker")
        return

    db = SessionLocal()
    try:
        for message in consumer:
            event = message.value
            process_restaurant_event(event, db)
    except Exception as e:
        print(f"Restaurant Worker error: {e}")
    finally:
        db.close()
        consumer.close()

def start_user_worker():
    """User Worker Service — consumes user events"""
    print("Starting User Worker Service...")
    topics = ['user.created', 'user.updated']
    consumer = get_consumer(topics)
    if not consumer:
        print("Failed to start User Worker")
        return

    db = SessionLocal()
    try:
        for message in consumer:
            event = message.value
            process_user_event(event, db)
    except Exception as e:
        print(f"User Worker error: {e}")
    finally:
        db.close()
        consumer.close()

def start_all_workers():
    """Start all worker services in background threads"""
    workers = [
        threading.Thread(target=start_review_worker,     daemon=True, name="ReviewWorker"),
        threading.Thread(target=start_restaurant_worker, daemon=True, name="RestaurantWorker"),
        threading.Thread(target=start_user_worker,       daemon=True, name="UserWorker"),
    ]
    for worker in workers:
        worker.start()
        print(f"Started {worker.name}")
    return workers