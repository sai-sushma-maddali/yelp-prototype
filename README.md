# Yelp Prototype

A Yelp-style restaurant discovery and review platform built with **FastAPI**, **React**, and **MySQL**. Features JWT authentication, restaurant management, reviews, favorites, photo uploads, an AI-powered chatbot, Kafka event streaming, MongoDB session storage, and Redux state management.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI |
| Primary Database | MySQL |
| Document Database | MongoDB |
| ORM | SQLAlchemy |
| Authentication | JWT (python-jose) |
| Password Hashing | bcrypt (passlib) |
| Message Broker | Apache Kafka |
| AI Chatbot | LangChain + Ollama (Llama 3.2) + Tavily |
| Frontend | ReactJS + Bootstrap + Redux |
| API Docs | Swagger UI (built-in) |

---

## Project Structure

```
yelp-prototype/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── database.py              # MySQL connection
│   │   ├── mongodb.py               # MongoDB connection
│   │   ├── migrate_to_mongo.py      # MySQL → MongoDB migration script
│   │   ├── config.py
│   │   ├── init_db.py
│   │   ├── models/                  # SQLAlchemy models
│   │   ├── routers/                 # API route handlers
│   │   ├── schemas/                 # Pydantic schemas
│   │   └── services/
│   │       ├── auth.py
│   │       ├── dependencies.py
│   │       ├── ai_service.py
│   │       ├── kafka_producer.py    # Kafka event publishers
│   │       ├── kafka_consumer.py    # Kafka worker services
│   │       └── session_service.py   # MongoDB session management
│   ├── uploads/
│   ├── .env
│   ├── .gitignore
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── store/                   # Redux store
│   │       ├── index.js
│   │       └── slices/
│   │           ├── authSlice.js
│   │           ├── restaurantSlice.js
│   │           ├── reviewSlice.js
│   │           └── favoriteSlice.js
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── k8s/                             # Kubernetes manifests
│   └── kafka/
│       ├── zookeeper.yaml
│       ├── kafka.yaml
│       ├── kafka-topics.yaml
│       └── kafka-nodeport.yaml
├── docker-compose-kafka.yml         # Kafka + Zookeeper via docker-compose
├── yelp_db.sql                      # Database dump with schema + sample data
└── README.md
```

---

## Prerequisites

- Python 3.12+
- MySQL 8.0+
- MongoDB 8.0+
- Node.js 18+
- Docker Desktop (for Kafka)
- [Ollama](https://ollama.com) with Llama 3.2: `ollama pull llama3.2`

---

## Setup & Run

### 1. Clone the Repository

```bash
git clone https://github.com/sai-sushma-maddali/yelp-prototype.git
cd yelp-prototype
```

---

### 2. Import the Database

Open MySQL and run:

```sql
CREATE DATABASE yelp_db;
```

Then import the SQL file:

```bash
mysql -u root -p yelp_db < yelp_db.sql
```

> This creates all tables and loads sample data automatically.

---

### 3. Backend Setup

```bash
cd backend
python -m venv venv
```

Activate venv:
- **Windows:** `venv\Scripts\activate`
- **Mac/Linux:** `source venv/bin/activate`

```bash
pip install -r requirements.txt
```

Create `backend/.env`:
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

MONGO_URL=mongodb://localhost:27017
MONGO_DB=yelp_db_mongo
```

Start the backend:
```bash
uvicorn app.main:app --reload
```

> API runs at http://localhost:8000 — Swagger UI at http://localhost:8000/docs

---

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8000
```

Start the frontend:
```bash
npm start
```

> App runs at http://localhost:3000

---

### 5. Start Ollama (AI Chatbot)

In a separate terminal:
```bash
ollama serve
```

---

### 6. Start Kafka (docker-compose)

In a separate terminal from project root:
```bash
docker-compose -f docker-compose-kafka.yml up -d
```

Verify containers are running:
```bash
docker ps
```

You should see `kafka` and `zookeeper` containers running.

> Kafka runs at localhost:9092. Worker services start automatically when the backend starts.

---

### 7. Migrate Data to MongoDB (One-time setup)

After the backend is running:
```bash
python -m app.migrate_to_mongo
```

This copies all MySQL data to MongoDB and creates a sessions collection with TTL index.

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Food Lover | john@example.com | password123 |
| Food Lover 2 | james.mitchell@gmail.com | password123 |
| Restaurant Owner | owner@example.com | password123 |

---

## Pages

| Page | Route | Access |
|------|-------|--------|
| Explore / Home | `/` | Public |
| Restaurant Details | `/restaurants/:id` | Public |
| Login | `/login` | Public |
| Signup | `/signup` | Public |
| Add Restaurant | `/add-restaurant` | Logged in |
| Edit Restaurant | `/restaurants/:id/edit` | Creator only |
| Profile | `/profile` | Logged in |
| Owner Dashboard | `/owner/dashboard` | Owner only |

---

## Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register |
| POST | `/auth/login` | Login |
| GET | `/restaurants` | Search restaurants |
| POST | `/restaurants` | Add restaurant |
| POST | `/restaurants/{id}/reviews` | Write review → triggers Kafka event |
| POST | `/restaurants/{id}/favorite` | Save favorite |
| POST | `/restaurants/{id}/photos` | Upload photo |
| POST | `/ai-assistant/chat` | AI chatbot |
| GET | `/owner/dashboard/{id}` | Owner analytics |

---

## Kafka Event Flow

```
FastAPI (Producer) → Kafka Topic → Worker Service (Consumer) → Database
```

| Topic | Producer | Consumer |
|-------|----------|----------|
| `review.created` | Review API | Review Worker |
| `review.updated` | Review API | Review Worker |
| `review.deleted` | Review API | Review Worker |
| `restaurant.created` | Restaurant API | Restaurant Worker |
| `restaurant.updated` | Restaurant API | Restaurant Worker |
| `restaurant.claimed` | Owner API | Restaurant Worker |
| `user.created` | Auth API | User Worker |
| `user.updated` | User API | User Worker |

---

## MongoDB Collections

| Collection | Description |
|------------|-------------|
| `users` | Migrated user accounts with bcrypt passwords |
| `user_preferences` | AI assistant preferences |
| `restaurants` | Migrated restaurant listings |
| `reviews` | Migrated reviews |
| `favorites` | Migrated favorites |
| `restaurant_photos` | Migrated photos |
| `restaurant_claims` | Migrated claims |
| `sessions` | JWT sessions with TTL expiry (24 hours) |

---

## Redux Store

| Slice | Manages |
|-------|---------|
| `authSlice` | JWT token, user info, login/logout |
| `restaurantSlice` | Restaurant list, filters, selected restaurant |
| `reviewSlice` | Reviews for current restaurant |
| `favoriteSlice` | User's saved restaurants |

---

##  Roadmap

- [x] User authentication (JWT)
- [x] User profile & photo upload
- [x] Restaurant CRUD + photo gallery
- [x] Reviews system
- [x] Favorites & history
- [x] Owner dashboard & analytics
- [x] AI Assistant (Ollama + Tavily)
- [x] React frontend — all pages
- [x] Redux state management
- [x] Kafka producer/consumer integration
- [x] MongoDB migration + session storage
- [x] JMeter performance testing
- [ ] Docker + Kubernetes + AWS deployment

---

## .gitignore

**Backend:** `venv/`, `__pycache__/`, `.env`, `uploads/`

**Frontend:** `node_modules/`, `.env`, `build/`

---

## License

Educational purposes — DATA 236 Distributed Systems, SJSU Spring 2026.