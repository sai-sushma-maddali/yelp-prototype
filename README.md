# Yelp Prototype

A Yelp-style restaurant discovery and review platform built with **FastAPI**, **React**, and **MySQL**. Features a RESTful backend API with JWT authentication, restaurant management, reviews, favorites, and an AI-powered assistant chatbot.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI |
| Database | MySQL |
| ORM | SQLAlchemy |
| Authentication | JWT (python-jose) |
| Password Hashing | bcrypt (passlib) |
| AI Chatbot | LangChain + Ollama (Llama 3.2) + Tavily |
| Frontend | ReactJS (coming soon) |
| API Docs | Swagger UI (built-in) |

---

## Project Structure

```
yelp-prototype/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app entry point
│   │   ├── database.py           # DB connection & session
│   │   ├── config.py             # App settings from .env
│   │   ├── init_db.py            # Create all DB tables
│   │   ├── models/               # SQLAlchemy table definitions
│   │   │   ├── user.py
│   │   │   ├── user_preference.py
│   │   │   ├── restaurant.py
│   │   │   ├── review.py
│   │   │   ├── favorite.py
│   │   │   ├── restaurant_photo.py
│   │   │   ├── review_photo.py
│   │   │   └── restaurant_claim.py
│   │   ├── routers/              # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── restaurants.py
│   │   │   ├── reviews.py
│   │   │   ├── favorites.py
│   │   │   ├── owner.py
│   │   │   └── ai_assistant.py
│   │   ├── schemas/              # Pydantic request/response models
│   │   │   ├── user.py
│   │   │   ├── preference.py
│   │   │   ├── restaurant.py
│   │   │   ├── review.py
│   │   │   ├── favorite.py
│   │   │   ├── owner.py
│   │   │   └── chat.py
│   │   └── services/             # Business logic
│   │       ├── auth.py           # Password hashing & JWT
│   │       ├── dependencies.py   # get_current_user, get_current_owner
│   │       └── ai_service.py     # AI chatbot (Ollama + Tavily)
│   ├── uploads/                  # Uploaded images (gitignored)
│   ├── .env                      # Environment variables (gitignored)
│   ├── .gitignore
│   └── requirements.txt
└── frontend/                     # React app (coming soon)
```

---

## Prerequisites

- Python 3.12+
- MySQL 8.0+
- [Ollama](https://ollama.com) installed and running locally
- Llama 3.2 pulled: `ollama pull llama3.2`
- Node.js (for frontend, coming soon)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sai-sushma-maddali/yelp-prototype.git
cd yelp-prototype
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

- **Mac/Linux:** `source venv/bin/activate`
- **Windows:** `venv\Scripts\activate`

Install dependencies:
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=yelp_db

SECRET_KEY=your_super_secret_key_change_this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
TAVILY_API_KEY=your_tavily_key_here
```



### 4. Start Ollama

```bash
ollama serve
```

Verify the model is available:
```bash
ollama list
# should show llama3.2:latest
```

If not, pull it:
```bash
ollama pull llama3.2
```

### 5. Set Up the Database

```sql
CREATE DATABASE yelp_db;
```

Initialize all tables:
```bash
python -m app.init_db
```

### 6. Run the Server

```bash
uvicorn app.main:app --reload
```

- **API Base URL:** http://localhost:8000
- **Swagger UI:** http://localhost:8000/docs

---

## API Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register as user or owner |
| POST | `/auth/login` | Login and receive JWT token |
| GET | `/auth/me` | Get current logged-in user |

### User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | View profile |
| PUT | `/users/profile` | Update profile details |
| POST | `/users/profile/picture` | Upload profile picture |
| GET | `/users/preferences` | Get AI assistant preferences |
| PUT | `/users/preferences` | Save AI assistant preferences |

### Restaurants
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/restaurants` | Create a restaurant listing |
| GET | `/restaurants` | Search/list restaurants (with filters) |
| GET | `/restaurants/{id}` | Get restaurant details |
| PUT | `/restaurants/{id}` | Update restaurant |
| DELETE | `/restaurants/{id}` | Delete restaurant |
| GET | `/restaurants/me/listings` | Get my created restaurants |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/restaurants/{id}/reviews` | Write a review |
| GET | `/restaurants/{id}/reviews` | Get all reviews for a restaurant |
| PUT | `/restaurants/{id}/reviews/{review_id}` | Edit own review |
| DELETE | `/restaurants/{id}/reviews/{review_id}` | Delete own review |
| GET | `/users/me/reviews` | Get all my reviews |

### Favorites & History
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/restaurants/{id}/favorite` | Add to favorites |
| DELETE | `/restaurants/{id}/favorite` | Remove from favorites |
| GET | `/users/me/favorites` | Get my favorites |
| GET | `/users/me/history` | Get activity history |

### Restaurant Owner
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/owner/claim` | Claim a restaurant |
| GET | `/owner/restaurants` | Get owned restaurants |
| PUT | `/owner/restaurants/{id}` | Update owned restaurant |
| GET | `/owner/restaurants/{id}/reviews` | View reviews (read-only) |
| GET | `/owner/dashboard/{id}` | Analytics dashboard |
| GET | `/owner/claims` | View my claims |

### AI Assistant
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai-assistant/chat` | Chat with the AI restaurant assistant |

---

## AI Assistant

The AI chatbot is powered by **Ollama (Llama 3.2)** running locally and **Tavily** for real-time web search.

### How it works
1. User sends a natural language message e.g. *"I want vegan food tonight"*
2. Ollama extracts search filters from the message (cuisine, price, keywords, city)
3. The app searches the restaurant database using those filters
4. Tavily adds real-world web context (if API key is configured)
5. Ollama generates a personalised, conversational response
6. Restaurant cards are returned alongside the text response

### Example request
```json
POST /ai-assistant/chat
{
  "message": "Something romantic for an anniversary dinner",
  "conversation_history": []
}
```

### Example response
```json
{
  "response": "For a romantic anniversary dinner, I recommend Candlelight Bistro...",
  "restaurants": [
    {
      "id": 3,
      "name": "Candlelight Bistro",
      "cuisine_type": "French",
      "price_tier": "$$$",
      "avg_rating": 4.8
    }
  ],
  "filters_used": {
    "keywords": "romantic",
    "sort_by": "rating"
  }
}
```

---

## Authentication

This project uses **JWT Bearer tokens**:

1. Call `POST /auth/login` with your credentials
2. Copy the `access_token` from the response
3. In Swagger UI, click **Authorize 🔒** and paste the token
4. All protected requests will include it automatically

---

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | All users (reviewers + owners) |
| `user_preferences` | AI assistant preferences per user |
| `restaurants` | Restaurant listings |
| `reviews` | User reviews with ratings |
| `favorites` | User's saved restaurants |
| `restaurant_photos` | Photos for restaurants |
| `review_photos` | Photos attached to reviews |
| `restaurant_claims` | Owner claim requests |

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| User | john@example.com | password123 |
| Owner | owner@example.com | password123 |

---

## Restaurant Search Parameters

| Parameter | Description |
|-----------|-------------|
| `name` | Search by name |
| `cuisine_type` | Filter by cuisine |
| `city` | Filter by city |
| `zip_code` | Filter by zip |
| `price_tier` | Filter by price ($–$$$$) |
| `keywords` | Search in description/amenities |
| `skip` / `limit` | Pagination |

---

## Roadmap

- [x] User authentication (JWT)
- [x] User profile management
- [x] User AI preferences
- [x] Restaurant CRUD
- [x] Restaurant search & filtering
- [x] Reviews system
- [x] Favorites & user history
- [x] Restaurant owner features
- [x] Owner analytics dashboard
- [x] AI Assistant chatbot (Ollama + Tavily)
- [ ] Restaurant photo uploads
- [ ] React frontend
- [ ] Deployment

---

## .gitignore

```
venv/
__pycache__/
*.pyc
.env
uploads/
*.db
```

---

## License

This project is for educational purposes — DATA 236 Distributed Systems, SJSU Spring 2026.