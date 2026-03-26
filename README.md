# AI Financial Companion

EDUCATIONAL_ONLY: This application provides educational information and is not financial advice. Consult a certified financial advisor before making investment decisions.

## Features
- Real Google OAuth token verification support (`/api/v1/auth/google`) with secure JWT sessions.
- Account-scoped expense CRUD (`/api/v1/expenses`) and persisted SMS import to DB.
- AI insights + AI chat coach (LLM mode when `OPENAI_API_KEY` is provided, heuristic fallback otherwise).
- React app with Google login, dashboard, expense manager, and chatbot.

## Quick start
```bash
docker-compose up --build
```

## Local backend
```bash
pip install -r backend/requirements.txt
PYTHONPATH=backend uvicorn app.main:app --reload
```

## Seed demo account (actual DB insert)
```bash
PYTHONPATH=backend python scripts/seed_demo_user.py
```

## Local frontend
```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

## Environment variables
- `DATABASE_URL` (default sqlite dev DB)
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `OPENAI_API_KEY`
- `VITE_GOOGLE_CLIENT_ID` (frontend)

## Tests
```bash
PYTHONPATH=backend pytest backend/tests -q
npm --prefix frontend test
```
