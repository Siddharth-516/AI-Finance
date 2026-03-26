# AI Financial Companion

EDUCATIONAL_ONLY: This application provides educational information and is not financial advice. Consult a certified financial advisor before making investment decisions.

## Features
- Google OAuth-style login endpoint (`/api/v1/auth/google`) with user-scoped data.
- Expense CRUD APIs (`/api/v1/expenses`) with per-user isolation.
- AI insights (`/api/v1/insights`) and AI chat coach (`/api/v1/chat`).
- React app with Login + Dashboard + Transactions + AI coach.

## Quick start
```bash
docker-compose up --build
```

## Local backend
```bash
pip install -r backend/requirements.txt
PYTHONPATH=backend uvicorn app.main:app --reload
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

## Tests
```bash
PYTHONPATH=backend pytest backend/tests -q
npm --prefix frontend test
```
