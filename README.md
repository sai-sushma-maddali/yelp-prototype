# Yelp Prototype — Frontend (Lab 1)

React + Vite + TailwindCSS. Integrates with FastAPI backend via Axios.

## Run

```bash
cd frontend
npm install
npm run dev
```

Set API base URL (optional):

```env
# frontend/.env
VITE_API_URL=http://localhost:8000
```

## Rubric coverage (frontend)

| Requirement | Where |
|-------------|--------|
| Explore / search + filters + cards | `/` — name, cuisine, keywords, location, sort |
| Restaurant details + reviews | `/restaurant/:id` |
| User signup / login | `/signup`, `/login` |
| Profile + preferences (AI) | `/profile` — country dropdown, state abbrev, cuisines, price, radius, dietary, ambiance, sort |
| Add restaurant | `/add-restaurant` |
| Write review | `/restaurant/:id/review` |
| AI Assistant | Explore page — chat, quick actions, thinking state, new chat, recommendation cards → detail |
| Favourites + History | `/favourites`, `/history` |
| Owner signup/login | `/owner/signup`, `/owner/login` |
| Owner profile / listing | `/owner/restaurant` |
| Claim restaurant | `/owner/claim` |
| Owner reviews dashboard | `/owner/reviews` |
| Owner analytics | `/owner/analytics` |
| Responsive + Tailwind | Layout + grid breakpoints |
| Axios + loading/errors | Services + pages |
| Structure | `components/`, `pages/`, `services/`, `context/` |

Backend must implement matching routes (or adjust `src/services/*` to your API).

## Screenshots for report

1. Home with **Ask Assistant** + search + results  
2. Restaurant detail + reviews  
3. Profile + AI preferences tabs  
4. Write review / Add restaurant  
5. Owner analytics + reviews dashboard  
