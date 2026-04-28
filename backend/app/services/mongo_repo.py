from datetime import datetime
from pymongo import ReturnDocument


async def get_next_id(db, key: str) -> int:
    # Keep counter in sync with preloaded sample data.
    max_doc = await db[key].find_one(sort=[("_id", -1)])
    current_max_id = int(max_doc["_id"]) if max_doc and "_id" in max_doc else 0
    await db.counters.update_one(
        {"_id": key},
        {"$setOnInsert": {"seq": current_max_id}},
        upsert=True,
    )
    await db.counters.update_one({"_id": key}, {"$max": {"seq": current_max_id}})

    counter = await db.counters.find_one_and_update(
        {"_id": key},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return int(counter["seq"])


def normalize_doc(doc: dict | None) -> dict | None:
    if not doc:
        return None
    normalized = dict(doc)
    normalized["id"] = normalized.pop("_id")
    return normalized


def now_utc() -> datetime:
    return datetime.utcnow()
