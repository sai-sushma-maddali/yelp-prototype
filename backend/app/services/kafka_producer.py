from kafka import KafkaProducer
import json
import logging
import os

logger = logging.getLogger(__name__)

producer = None


def _bootstrap_servers():
    raw = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092").strip()
    hosts = [h.strip() for h in raw.split(",") if h.strip()]
    return hosts or ["localhost:9092"]


def get_producer():
    global producer
    if producer is None:
        try:
            producer = KafkaProducer(
                bootstrap_servers=_bootstrap_servers(),
                value_serializer=lambda v: json.dumps(v, default=str).encode("utf-8"),
                key_serializer=lambda k: k.encode("utf-8") if k else None,
                acks="all",
                retries=3,
                request_timeout_ms=15000,
                metadata_max_age_ms=5000,
                max_block_ms=2000,
                delivery_timeout_ms=5000,
            )
            logger.info("Kafka producer connected successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Kafka: {e}")
            producer = None
    return producer

def publish_event(topic: str, key: str, data: dict):
    """Publish an event to a Kafka topic"""
    try:
        p = get_producer()
        if p is None:
            logger.warning(f"Kafka not available — skipping event: {topic}")
            return False
        # Avoid blocking request threads when Kafka is unreachable.
        # We still attempt delivery, but fail fast if brokers are down.
        future = p.send(topic, key=key, value=data)
        future.get(timeout=3)
        logger.info(f"Published to {topic}: {data}")
        return True
    except Exception as e:
        logger.error(f"Failed to publish to {topic}: {e}")
        return False

# ── Review Events ─────────────────────────────────────────────
def publish_review_created(review_id: int, user_id: int,
                           restaurant_id: int, rating: int, comment: str):
    publish_event(
        topic="review.created",
        key=str(review_id),
        data={
            "event":         "review.created",
            "review_id":     review_id,
            "user_id":       user_id,
            "restaurant_id": restaurant_id,
            "rating":        rating,
            "comment":       comment
        }
    )

def publish_review_updated(review_id: int, user_id: int,
                           restaurant_id: int, rating: int, comment: str):
    publish_event(
        topic="review.updated",
        key=str(review_id),
        data={
            "event":         "review.updated",
            "review_id":     review_id,
            "user_id":       user_id,
            "restaurant_id": restaurant_id,
            "rating":        rating,
            "comment":       comment
        }
    )

def publish_review_deleted(review_id: int, restaurant_id: int):
    publish_event(
        topic="review.deleted",
        key=str(review_id),
        data={
            "event":         "review.deleted",
            "review_id":     review_id,
            "restaurant_id": restaurant_id
        }
    )

# ── Restaurant Events ─────────────────────────────────────────
def publish_restaurant_created(restaurant_id: int, name: str,
                                cuisine_type: str, city: str, owner_id: int):
    publish_event(
        topic="restaurant.created",
        key=str(restaurant_id),
        data={
            "event":          "restaurant.created",
            "restaurant_id":  restaurant_id,
            "name":           name,
            "cuisine_type":   cuisine_type,
            "city":           city,
            "owner_id":       owner_id
        }
    )

def publish_restaurant_updated(restaurant_id: int, name: str, owner_id: int):
    publish_event(
        topic="restaurant.updated",
        key=str(restaurant_id),
        data={
            "event":         "restaurant.updated",
            "restaurant_id": restaurant_id,
            "name":          name,
            "owner_id":      owner_id
        }
    )

def publish_restaurant_claimed(restaurant_id: int, owner_id: int):
    publish_event(
        topic="restaurant.claimed",
        key=str(restaurant_id),
        data={
            "event":         "restaurant.claimed",
            "restaurant_id": restaurant_id,
            "owner_id":      owner_id
        }
    )

# ── User Events ───────────────────────────────────────────────
def publish_user_created(user_id: int, name: str, email: str, role: str):
    publish_event(
        topic="user.created",
        key=str(user_id),
        data={
            "event":   "user.created",
            "user_id": user_id,
            "name":    name,
            "email":   email,
            "role":    role
        }
    )

def publish_user_updated(user_id: int, name: str, email: str):
    publish_event(
        topic="user.updated",
        key=str(user_id),
        data={
            "event":   "user.updated",
            "user_id": user_id,
            "name":    name,
            "email":   email
        }
    )