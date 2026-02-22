# AI Financial Companion

EDUCATIONAL_ONLY: This application provides educational information and is not financial advice. Consult a certified financial advisor before making investment decisions.

## Quick start
```bash
docker-compose up --build
```

## Local development
- Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
- Frontend: `cd frontend && npm install && npm run dev`

## ENV vars
`DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, ENCRYPTION_KEY, CORS_ORIGINS`

## Migrations
`alembic -c backend/alembic.ini upgrade head`

## Tests
- Backend: `PYTHONPATH=backend pytest backend/tests -q`
- Frontend: `cd frontend && npm test`

## Retrain model
`./scripts/retrain_pipeline.sh`

## Deploy
- Docker image via GitHub Actions.
- K8s manifests in `infra/k8s`.
- Terraform stubs in `infra/terraform`.

## Demo credentials
- `demo@example.com / Demo@12345`
