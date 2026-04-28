import os
import re
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_ollama import ChatOllama
from langchain_tavily import TavilySearch
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:latest")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

llm = ChatOllama(model=OLLAMA_MODEL, base_url=OLLAMA_BASE_URL, temperature=0.7)
search_tool = None
if TAVILY_API_KEY:
    os.environ["TAVILY_API_KEY"] = TAVILY_API_KEY
    search_tool = TavilySearch(max_results=3)


def _build_short_reason(user_message: str, restaurant: dict) -> str:
    query = (user_message or "").lower()
    cuisine = (restaurant.get("cuisine_type") or "").strip()
    city = (restaurant.get("city") or "").strip()
    rating = restaurant.get("avg_rating", 0)
    reviews = restaurant.get("review_count", 0)
    price = (restaurant.get("price_tier") or "").strip()
    reason_parts = []
    if cuisine and cuisine.lower() in query:
        reason_parts.append(f"matches your {cuisine} preference")
    if city and city.lower() in query:
        reason_parts.append(f"in {city}")
    if price and price in query:
        reason_parts.append(f"fits your {price} budget")
    if rating and rating >= 4.0:
        reason_parts.append(f"highly rated ({rating}★)")
    if reviews and reviews >= 20:
        reason_parts.append(f"popular with {reviews} reviews")
    if not reason_parts:
        return f"Solid pick based on your request with {rating}★ rating."
    return f"This place {' and '.join(reason_parts)}."


def format_bullet_recommendations(user_message: str, restaurants: list) -> str:
    if not restaurants:
        return "- No exact match found right now.\n- Try a broader query (cuisine, city, or budget) for better suggestions."
    lines = ["Top picks for you:"]
    for r in restaurants[:3]:
        lines.append(
            f"- {r['name']} ({r.get('cuisine_type', 'Mixed')} | {r.get('price_tier', 'N/A')} | {r.get('avg_rating', 0)}★): {_build_short_reason(user_message, r)}"
        )
    return "\n".join(lines)


async def get_user_preferences(user_id: int, mongo) -> dict:
    prefs = await mongo.user_preferences.find_one({"user_id": user_id})
    if not prefs:
        return {}
    return {
        "cuisine_preferences": prefs.get("cuisine_preferences") or "any",
        "price_range": prefs.get("price_range") or "any",
        "preferred_location": prefs.get("preferred_location") or "any",
        "dietary_needs": prefs.get("dietary_needs") or "none",
        "ambiance": prefs.get("ambiance") or "any",
        "sort_preference": prefs.get("sort_preference") or "rating",
    }


async def search_restaurants(mongo, filters: dict) -> list:
    query = {}
    if filters.get("cuisine_type"):
        query["cuisine_type"] = {"$regex": filters["cuisine_type"], "$options": "i"}
    if filters.get("city"):
        query["city"] = {"$regex": filters["city"], "$options": "i"}
    if filters.get("price_tier"):
        query["price_tier"] = filters["price_tier"]
    if filters.get("keywords"):
        kw = filters["keywords"]
        tokens = [re.escape(t) for t in re.findall(r"[a-zA-Z0-9$]+", kw) if len(t) > 1]
        keyword_pattern = "|".join(tokens) if tokens else re.escape(kw)
        query["$or"] = [
            {"description": {"$regex": keyword_pattern, "$options": "i"}},
            {"amenities": {"$regex": keyword_pattern, "$options": "i"}},
            {"cuisine_type": {"$regex": keyword_pattern, "$options": "i"}},
            {"name": {"$regex": keyword_pattern, "$options": "i"}},
        ]
    cursor = mongo.restaurants.find(query)
    if filters.get("sort_by", "rating") == "popularity":
        cursor = cursor.sort("review_count", -1)
    else:
        cursor = cursor.sort("avg_rating", -1)
    restaurants = await cursor.limit(5).to_list(length=5)
    # If strict filters find nothing, fall back to top-rated restaurants so
    # conversational prompts like "find dinner tonight" still return suggestions.
    if not restaurants:
        fallback_query = {}
        q = (filters.get("keywords") or "").lower()
        if "romantic" in q or "date" in q:
            fallback_query["$or"] = [
                {"amenities": {"$regex": "romantic|reservations|bar", "$options": "i"}},
                {"description": {"$regex": "romantic|fine dining|candle", "$options": "i"}},
            ]
        elif "vegan" in q or "vegetarian" in q:
            fallback_query["$or"] = [
                {"amenities": {"$regex": "vegan|vegetarian", "$options": "i"}},
                {"description": {"$regex": "vegan|vegetarian|plant-based", "$options": "i"}},
            ]
        elif "cheap" in q or "budget" in q or "$" in q:
            fallback_query["price_tier"] = "$"
        elif "fine" in q or "fancy" in q or "luxury" in q:
            fallback_query["price_tier"] = "$$$"

        restaurants = await mongo.restaurants.find(fallback_query).sort("avg_rating", -1).limit(5).to_list(length=5)
        if not restaurants:
            restaurants = await mongo.restaurants.find({}).sort("avg_rating", -1).limit(5).to_list(length=5)
    return [
        {
            "id": r["_id"],
            "name": r.get("name"),
            "cuisine_type": r.get("cuisine_type"),
            "city": r.get("city"),
            "price_tier": r.get("price_tier"),
            "avg_rating": r.get("avg_rating", 0),
            "review_count": r.get("review_count", 0),
            "description": r.get("description"),
            "amenities": r.get("amenities"),
            "address": r.get("address"),
            "phone": r.get("phone"),
        }
        for r in restaurants
    ]


def extract_filters_from_message(user_message: str, preferences: dict) -> dict:
    system_prompt = """You are a filter extraction assistant.
Extract filters and return ONLY JSON:
{"cuisine_type":null,"price_tier":null,"keywords":null,"city":null,"sort_by":"rating"}"""
    user_prompt = f"User query: {user_message}\nPreferences: {preferences}\nExtract JSON:"
    try:
        response = llm.invoke([SystemMessage(content=system_prompt), HumanMessage(content=user_prompt)])
        import json
        import re
        text = response.content.strip()
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            filters = json.loads(match.group())
            if not filters.get("city") and preferences.get("preferred_location"):
                filters["city"] = preferences["preferred_location"].split(",")[0].strip()
            if not filters.get("sort_by"):
                filters["sort_by"] = preferences.get("sort_preference", "rating")
            return filters
    except Exception:
        pass

    query = (user_message or "").lower()
    detected_cuisine = None
    for cuisine in [
        "italian", "mexican", "chinese", "japanese", "indian", "american",
        "french", "mediterranean", "korean", "vietnamese", "spanish", "greek",
    ]:
        if cuisine in query:
            detected_cuisine = cuisine
            break

    detected_price = None
    for tier in ["$$$$", "$$$", "$$", "$"]:
        if tier in query:
            detected_price = tier
            break

    return {
        "cuisine_type": detected_cuisine.title() if detected_cuisine else None,
        "price_tier": detected_price,
        "city": preferences.get("preferred_location", "").split(",")[0].strip() or None,
        "sort_by": preferences.get("sort_preference", "rating"),
        "keywords": user_message[:100] if not detected_cuisine else None,
    }


def get_web_context(query: str) -> str:
    if not search_tool:
        return ""
    try:
        results = search_tool.invoke({"query": f"restaurants {query}"})
        if results:
            return "\n".join([r.get("content", "")[:200] for r in results[:2]])
    except Exception:
        return ""
    return ""


def build_recommendation_prompt(user_message: str, preferences: dict, restaurants: list, web_context: str, conversation_history: list) -> list:
    restaurant_list = "\n".join([
        f"{i+1}. {r['name']} | {r['cuisine_type']} | {r['price_tier']} | Rating: {r['avg_rating']}★ ({r['review_count']} reviews) | {r['city']}"
        for i, r in enumerate(restaurants)
    ]) if restaurants else "No restaurants found matching the criteria."
    system_prompt = f"""You are a friendly restaurant assistant.
USER PREFERENCES: {preferences}
AVAILABLE RESTAURANTS:
{restaurant_list}
{'ADDITIONAL WEB CONTEXT: ' + web_context if web_context else ''}
INSTRUCTIONS:
- Recommend ONLY from database restaurants above
- DO NOT write paragraphs
- Max 4 bullet points
- Format exactly:
Top picks for you:
- <Restaurant> (<Cuisine> | <Price> | <Rating>★): <One short reason>"""
    messages = [SystemMessage(content=system_prompt)]
    for msg in conversation_history[-6:]:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))
    messages.append(HumanMessage(content=user_message))
    return messages


async def process_chat(user_message: str, conversation_history: list, user_id: int, mongo) -> dict:
    try:
        preferences = await get_user_preferences(user_id, mongo)
        filters = extract_filters_from_message(user_message, preferences)
        restaurants = await search_restaurants(mongo, filters)
        web_context = get_web_context(user_message)
        messages = build_recommendation_prompt(user_message, preferences, restaurants, web_context, conversation_history)
        try:
            response = llm.invoke(messages)
            ai_response = response.content.strip()
        except Exception:
            ai_response = format_bullet_recommendations(user_message, restaurants)
        if "-" not in ai_response or len(ai_response) > 800:
            ai_response = format_bullet_recommendations(user_message, restaurants)
        return {"response": ai_response, "restaurants": restaurants, "filters_used": filters}
    except Exception:
        return {
            "response": "- I could not run advanced AI ranking right now.\n- Try again, or use cuisine/city/price filters while I use basic matching.",
            "restaurants": [],
            "filters_used": {},
        }
