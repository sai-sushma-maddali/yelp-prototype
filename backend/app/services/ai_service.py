from langchain_ollama import ChatOllama
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from sqlalchemy.orm import Session
from app.models.user_preference import UserPreference
from app.models.restaurant import Restaurant
from sqlalchemy import or_
import os
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL    = os.getenv("OLLAMA_MODEL", "llama3.2:latest")
TAVILY_API_KEY  = os.getenv("TAVILY_API_KEY")

# Initialize Ollama
llm = ChatOllama(
    model=OLLAMA_MODEL,
    base_url=OLLAMA_BASE_URL,
    temperature=0.7
)

# Initialize Tavily search (only if key is available)
search_tool = None
if TAVILY_API_KEY:
    os.environ["TAVILY_API_KEY"] = TAVILY_API_KEY
    search_tool = TavilySearchResults(max_results=3)


def get_user_preferences(user_id: int, db: Session) -> dict:
    """Load user preferences from database"""
    prefs = db.query(UserPreference).filter(
        UserPreference.user_id == user_id
    ).first()

    if not prefs:
        return {}

    return {
        "cuisine_preferences": prefs.cuisine_preferences or "any",
        "price_range":         prefs.price_range or "any",
        "preferred_location":  prefs.preferred_location or "any",
        "dietary_needs":       prefs.dietary_needs or "none",
        "ambiance":            prefs.ambiance or "any",
        "sort_preference":     prefs.sort_preference or "rating"
    }


def search_restaurants(db: Session, filters: dict) -> list:
    """Search restaurants in the database based on extracted filters"""
    query = db.query(Restaurant)

    if filters.get("cuisine_type"):
        query = query.filter(
            Restaurant.cuisine_type.ilike(f"%{filters['cuisine_type']}%")
        )
    if filters.get("city"):
        query = query.filter(
            Restaurant.city.ilike(f"%{filters['city']}%")
        )
    if filters.get("price_tier"):
        query = query.filter(
            Restaurant.price_tier == filters["price_tier"]
        )
    if filters.get("keywords"):
        kw = filters["keywords"]
        query = query.filter(
            or_(
                Restaurant.description.ilike(f"%{kw}%"),
                Restaurant.amenities.ilike(f"%{kw}%"),
                Restaurant.cuisine_type.ilike(f"%{kw}%"),
                Restaurant.name.ilike(f"%{kw}%")
            )
        )

    # Sort results
    sort_by = filters.get("sort_by", "rating")
    if sort_by == "rating":
        query = query.order_by(Restaurant.avg_rating.desc())
    elif sort_by == "popularity":
        query = query.order_by(Restaurant.review_count.desc())

    restaurants = query.limit(5).all()

    return [
        {
            "id":           r.id,
            "name":         r.name,
            "cuisine_type": r.cuisine_type,
            "city":         r.city,
            "price_tier":   r.price_tier,
            "avg_rating":   r.avg_rating,
            "review_count": r.review_count,
            "description":  r.description,
            "amenities":    r.amenities,
            "address":      r.address,
            "phone":        r.phone
        }
        for r in restaurants
    ]


def extract_filters_from_message(user_message: str, preferences: dict) -> dict:
    """
    Use Ollama to extract structured filters from a natural language query.
    Returns a dict with cuisine_type, price_tier, keywords, city, sort_by.
    """
    system_prompt = """You are a filter extraction assistant. 
Extract search filters from the user's restaurant query and return ONLY a JSON object.

Return this exact JSON format (use null for missing values):
{
  "cuisine_type": "Italian" or null,
  "price_tier": "$" or "$$" or "$$$" or "$$$$" or null,
  "keywords": "vegan romantic outdoor wifi" or null,
  "city": "San Jose" or null,
  "sort_by": "rating" or "popularity" or "price"
}

Examples:
- "vegan food" → {"cuisine_type": null, "price_tier": null, "keywords": "vegan", "city": null, "sort_by": "rating"}
- "cheap Italian in San Jose" → {"cuisine_type": "Italian", "price_tier": "$", "keywords": null, "city": "San Jose", "sort_by": "price"}
- "romantic dinner" → {"cuisine_type": null, "price_tier": null, "keywords": "romantic", "city": null, "sort_by": "rating"}

Return ONLY the JSON object. No explanation."""

    user_prompt = f"""User query: {user_message}
User preferences: cuisine={preferences.get('cuisine_preferences')}, price={preferences.get('price_range')}, location={preferences.get('preferred_location')}, dietary={preferences.get('dietary_needs')}

Extract filters as JSON:"""

    try:
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ])

        import json
        import re

        # Extract JSON from response
        text = response.content.strip()
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            filters = json.loads(json_match.group())
            # Apply user preferences as fallback
            if not filters.get("city") and preferences.get("preferred_location"):
                filters["city"] = preferences["preferred_location"].split(",")[0].strip()
            if not filters.get("sort_by"):
                filters["sort_by"] = preferences.get("sort_preference", "rating")
            return filters
    except Exception as e:
        print(f"Filter extraction error: {e}")

    # Fallback — apply user preferences directly
    return {
        "city":     preferences.get("preferred_location", "").split(",")[0].strip() or None,
        "sort_by":  preferences.get("sort_preference", "rating"),
        "keywords": user_message[:100]
    }


def get_web_context(query: str) -> str:
    """Use Tavily to search for additional context about restaurants"""
    if not search_tool:
        return ""
    try:
        results = search_tool.invoke({"query": f"restaurants {query}"})
        if results:
            return "\n".join([r.get("content", "")[:200] for r in results[:2]])
    except Exception as e:
        print(f"Tavily search error: {e}")
    return ""


def build_recommendation_prompt(
    user_message: str,
    preferences: dict,
    restaurants: list,
    web_context: str,
    conversation_history: list
) -> list:
    """Build the full message list for Ollama"""

    # Format restaurants for the prompt
    if restaurants:
        restaurant_list = "\n".join([
            f"{i+1}. {r['name']} | {r['cuisine_type']} | {r['price_tier']} | "
            f"Rating: {r['avg_rating']}★ ({r['review_count']} reviews) | "
            f"{r['city']} | {r.get('description', '')[:80]}"
            for i, r in enumerate(restaurants)
        ])
    else:
        restaurant_list = "No restaurants found matching the criteria."

    system_prompt = f"""You are a friendly and knowledgeable restaurant assistant for a Yelp-like platform. 
Your job is to help users discover restaurants and make dining decisions.

USER PREFERENCES:
- Favorite cuisines: {preferences.get('cuisine_preferences', 'not set')}
- Price preference: {preferences.get('price_range', 'not set')}
- Dietary needs: {preferences.get('dietary_needs', 'none')}
- Preferred ambiance: {preferences.get('ambiance', 'not set')}
- Location: {preferences.get('preferred_location', 'not set')}

AVAILABLE RESTAURANTS FROM DATABASE:
{restaurant_list}

{'ADDITIONAL WEB CONTEXT: ' + web_context if web_context else ''}

INSTRUCTIONS:
- Recommend from the database restaurants above
- Personalise recommendations based on user preferences
- Be conversational, warm and helpful — not robotic
- For each recommendation explain WHY it matches the user's query
- If no restaurants match, say so honestly and suggest what they could search for
- Keep responses concise — 3-5 sentences per recommendation
- Always mention the restaurant name, rating, price tier and why it fits"""

    messages = [SystemMessage(content=system_prompt)]

    # Add conversation history
    for msg in conversation_history[-6:]:  # last 6 messages for context
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))

    # Add current message
    messages.append(HumanMessage(content=user_message))
    return messages


async def process_chat(
    user_message: str,
    conversation_history: list,
    user_id: int,
    db: Session
) -> dict:
    """
    Main function that orchestrates the entire chatbot flow:
    1. Load user preferences
    2. Extract filters from message
    3. Search restaurants in DB
    4. Get web context (Tavily)
    5. Generate response with Ollama
    """
    try:
        # Step 1 - Load user preferences
        preferences = get_user_preferences(user_id, db)

        # Step 2 - Extract search filters from the message
        filters = extract_filters_from_message(user_message, preferences)
        print(f"Extracted filters: {filters}")

        # Step 3 - Search restaurants in DB
        restaurants = search_restaurants(db, filters)
        print(f"Found {len(restaurants)} restaurants")

        # Step 4 - Get web context if Tavily is available
        web_context = get_web_context(user_message)

        # Step 5 - Build prompt and generate response
        messages = build_recommendation_prompt(
            user_message,
            preferences,
            restaurants,
            web_context,
            conversation_history
        )

        response = llm.invoke(messages)
        ai_response = response.content.strip()

        return {
            "response":    ai_response,
            "restaurants": restaurants,
            "filters_used": filters
        }

    except Exception as e:
        print(f"Chat error: {e}")
        return {
            "response": "I'm sorry, I ran into an issue processing your request. Please try again.",
            "restaurants": [],
            "filters_used": {}
        }