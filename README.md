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
| AI Chatbot | LangChain + OpenAI + Tavily |
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
│   │   │   └── owner.py
│   │   ├── schemas/              # Pydantic request/response models
│   │   │   ├── user.py
│   │   │   ├── preference.py
│   │   │   ├── restaurant.py
│   │   │   ├── review.py
│   │   │   ├── favorite.py
│   │   │   └── owner.py
│   │   └── services/             # Business logic
│   │       ├── auth.py           # Password hashing & JWT
│   │       └── dependencies.py   # get_current_user, get_current_owner
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
- Node.js (for frontend, coming soon)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/yelp-prototype.git
cd yelp-prototype
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

- **Mac/Linux:**
```bash
source venv/bin/activate
```
- **Windows:**
```bash
venv\Scripts\activate
```

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

OPENAI_API_KEY=your_openai_key_here
TAVILY_API_KEY=your_tavily_key_here
```


### 4. Set Up the Database

Create the database in MySQL:

```sql
CREATE DATABASE yelp_db;
```

Then initialize all tables:

```bash
python -m app.init_db
```

You should see:
```
Creating tables...
Done!
```

### 5. Run the Server

```bash
uvicorn app.main:app --reload
```

The API will be available at:
- **API Base URL:** http://localhost:8000
- **Swagger UI (API Docs):** http://localhost:8000/docs

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

---

## Authentication

This project uses **JWT Bearer tokens**. To access protected endpoints:

1. Call `POST /auth/login` with your credentials
2. Copy the `access_token` from the response
3. In Swagger UI, click **Authorize 🔒** and paste the token
4. All protected requests will include it automatically

---

## Database Schema

The following tables are created automatically by `init_db.py`:

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

## Testing the API

**Quick test accounts:**

| Role | Email | Password |
|------|-------|----------|
| User | john@example.com | password123 |
| Owner | owner@example.com | password123 |

---

## Search & Filter

The `GET /restaurants` endpoint supports the following query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Search by restaurant name |
| `cuisine_type` | string | Filter by cuisine |
| `city` | string | Filter by city |
| `zip_code` | string | Filter by zip code |
| `price_tier` | string | Filter by price ($, $$, $$$, $$$$) |
| `keywords` | string | Search in description and amenities |
| `skip` | int | Pagination offset (default: 0) |
| `limit` | int | Results per page (default: 10) |

---

## AI Assistant (Coming Soon)

The AI chatbot feature will use:
- **LangChain** for natural language understanding
- **OpenAI** for generating responses
- **Tavily** for real-time web search
- User preferences loaded from the database for personalized recommendations

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
- [ ] AI Assistant chatbot
- [ ] Restaurant photo uploads
- [ ] React frontend
- [ ] Deployment

---

## Dependencies

Key packages (see `requirements.txt` for full list):

```
fastapi
uvicorn
sqlalchemy
pymysql
python-dotenv
passlib[bcrypt]
python-jose[cryptography]
python-multipart
pillow
langchain
langchain-openai
tavily-python
pydantic[email]
```

---

## .gitignore

Make sure your `.gitignore` includes:

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