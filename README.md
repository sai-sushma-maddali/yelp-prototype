# Yelp Prototype

A Yelp-style restaurant discovery and review platform built with **FastAPI**, **React**, and **MySQL**. Features JWT authentication, restaurant management, reviews, favorites, photo uploads, and an AI-powered chatbot.

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
| Frontend | ReactJS + Bootstrap |
| API Docs | Swagger UI (built-in) |

---

## Project Structure

```
yelp-prototype/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── config.py
│   │   ├── init_db.py
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
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
│   │   └── context/
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
└── yelp_db.sql                      # Database dump with schema + sample data
```

---

## Prerequisites

- Python 3.12+
- MySQL 8.0+
- Node.js 18+
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

##  Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register |
| POST | `/auth/login` | Login |
| GET | `/restaurants` | Search restaurants |
| POST | `/restaurants` | Add restaurant |
| POST | `/restaurants/{id}/reviews` | Write review |
| POST | `/restaurants/{id}/favorite` | Save favorite |
| POST | `/restaurants/{id}/photos` | Upload photo |
| POST | `/ai-assistant/chat` | AI chatbot |
| GET | `/owner/dashboard/{id}` | Owner analytics |

---


## .gitignore

**Backend:** `venv/`, `__pycache__/`, `.env`, `uploads/`

**Frontend:** `node_modules/`, `.env`, `build/`

---

##  License

Educational purposes — DATA 236 Distributed Systems, SJSU Spring 2026.