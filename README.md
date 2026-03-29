# AI Finance

A personal finance tracker with an AI coach built on top of a local LLM. Built as a hackathon project.

---

## What it does

- Track and categorize transactions manually or by pasting an SMS — it parses the amount, merchant, and category automatically
- Ask the AI coach questions about your spending in plain English ("Where am I overspending this month?", "Who are my top merchants?")
- See a simple dashboard with total spend, top category, and goal progress
- Sign in with Google for persistent data, or use guest mode for a temporary local session

The AI layer runs entirely on your machine via Ollama — your financial data never leaves your device.

---

## Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React (Vite), Tailwind CSS    |
| Backend  | FastAPI, JWT auth             |
| AI       | Ollama (`phi` model)          |
| Auth     | Google OAuth 2.0              |

---

## Getting started

### Prerequisites

- Node.js 18+
- Python 3.10+
- [Ollama](https://ollama.com) installed

### 1. Clone

```bash
git clone <your-repo-url>
cd AI-Finance-main
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Runs at `http://127.0.0.1:8000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`

### 4. AI (Ollama)

```bash
ollama pull phi
ollama run phi
```

The app falls back gracefully if Ollama isn't running.

### 5. Google login (optional)

Create `frontend/.env`:

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

In Google Cloud Console, add `http://localhost:5173` and `http://127.0.0.1:5173` as authorized origins. Skip this entirely if you just want to test with guest mode.

---

## Usage

1. Open `http://localhost:5173`
2. Log in with Google or continue as guest
3. Add transactions, or paste a bank SMS to auto-parse it
4. Ask the AI coach anything about your spending

---

## Notes

- Guest mode stores data in localStorage — it's cleared when you close the tab
- Google login requires you to set up your own OAuth client (no shared credentials are provided)
- The AI coach works best with a few transactions already added — context improves answers

---

## Planned

- Real bank/UPI integration
- Budget limits with overspend alerts
- Export to CSV

---

## License

Built for a hackathon. Use it however you like.
