from __future__ import annotations

import json
from collections import Counter
from typing import Any

import httpx

from app.core.config import settings

COACH_SYSTEM_PROMPT = """You are a smart financial coach inside a personal finance app.

RULES:
- Use the user's real data (transactions, totals, categories)
- Answer in 2-4 lines MAX
- Be specific (mention ₹ amounts, categories)
- No generic advice
- No long explanations unless asked

STYLE:
- Direct, practical
- Like a smart friend, not a textbook
- Always give ONE clear action

EXAMPLES:

Bad:
"Try saving more money."

Good:
"You spent ₹1200 on rent (highest). Try reducing 10% or renegotiating."

If greeting → respond casually.
If question unclear → ask a follow-up.
Be confident. If something looks bad, say it clearly.
Do not try to sound polite if the user is overspending.
"""

# ✅ FIXED ENDPOINT
LOCAL_LLM_URL = "http://127.0.0.1:11434/api/chat"

LOCAL_LLM_MODEL = (
    getattr(settings, "ollama_model", "")
    or getattr(settings, "local_ai_model", "")
    or "phi"
)


def _setting(name: str, default: Any = "") -> Any:
    return getattr(settings, name, default) or default


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value or default)
    except:
        return default


# ============================
# 🔥 FIXED OLLAMA FUNCTION
# ============================
def _local_ollama_reply(context: str) -> str | None:
    print("🔥 CALLING OLLAMA FUNCTION")
    payload = {
        "model": LOCAL_LLM_MODEL,
        "messages": [
            {"role": "system", "content": COACH_SYSTEM_PROMPT},
            {"role": "user", "content": context},
        ],
        "stream": False,
        "options": {
            "temperature": 0.2,
            "num_predict": 80,
        },
    }

    print("🔥 PAYLOAD:", payload)

    try:
        with httpx.Client(timeout=httpx.Timeout(60.0, connect=5.0)) as client:
            response = client.post(
                LOCAL_LLM_URL,
                headers={"Content-Type": "application/json"},
                json=payload,
            )

        print("🔥 STATUS:", response.status_code)
        print("🔥 RAW RESPONSE:", response.text)

        if response.status_code != 200:
            print("🔥 OLLAMA ERROR: non-200 status, run `ollama serve` on port 11434")
            return None

        data = response.json()

        # ✅ CORRECT PARSING
        reply = data.get("message", {}).get("content", "").strip()

        print("🔥 PARSED REPLY:", repr(reply))

        if not reply:
            print("🔥 OLLAMA ERROR: empty reply from API", data)
            return None

        return reply

    except Exception as e:
        print("🔥 OLLAMA ERROR:", str(e))
        return None


# ============================
# FALLBACK (UNCHANGED)
# ============================
def _fallback_reply(
    message: str,
    risk_level: str,
    income: str,
    spending_summary: dict[str, Any] | None = None,
    recent_expenses: list[dict[str, Any]] | None = None,    conversation_history: list[dict[str, str]] | None = None,) -> dict[str, Any]:

    total = sum(float(x.get("amount", 0)) for x in (recent_expenses or []))

    if total == 0:
        return {
            "reply": "Add some expenses first so I can help you better.",
            "mode": "fallback",
            "sources": ["fallback"],
        }

    return {
        "reply": f"You spent ₹{total:.2f}. Try reducing unnecessary expenses.",
        "mode": "fallback",
        "sources": ["fallback"],
    }


# ============================
# MAIN FUNCTION
# ============================
def coach_reply(
    message: str,
    risk_level: str,
    income: str,
    spending_summary: dict[str, Any] | None = None,
    recent_expenses: list[dict[str, Any]] | None = None,
    conversation_history: list[str] | None = None,
) -> dict[str, Any]:

    print("🔥 ENTERED coach_reply")
    print("🔥 USER MESSAGE:", message)

    normalized = (message or '').strip().lower()
    if normalized in ['hi', 'hello']:
        return {
            'reply': 'Hi! I’m here to help with your spending and savings questions. What would you like to know?',
            'mode': 'shortcut',
            'sources': ['local'],
        }
    if normalized in ['thanks', 'thank you', 'ok', 'okay']:
        return {
            'reply': 'You’re welcome! Ask anything else when ready.',
            'mode': 'shortcut',
            'sources': ['local'],
        }

    total_spend = float(spending_summary.get('total_spend', 0) if spending_summary else 0)
    top_categories = (spending_summary.get('top_categories', []) if spending_summary else [])
    top_category, top_amount = (top_categories[0] if top_categories else ('none', 0.0))
    top_amount = float(top_amount or 0.0)

    # Build a concise and safe transaction context block (last 10 entries)
    transaction_lines = []
    latest_transactions = (recent_expenses or [])[-10:]
    for tx in latest_transactions:
        date = tx.get('date', 'unknown')
        merchant = tx.get('merchant', 'unknown')
        category = tx.get('category', 'unknown')
        try:
            amount = float(tx.get('amount', 0) or 0)
        except Exception:
            amount = 0.0
        transaction_lines.append(f"- {date} | {merchant} | {category} | ₹{amount:.2f}")

    if not transaction_lines:
        transaction_lines = ['- none']

    context = f"""
User Profile:
- Risk: {risk_level}
- Income: {income}

Transactions (last 10):
{chr(10).join(transaction_lines)}

Spending Summary:
- Total: ₹{total_spend:.2f}
- Top category: {top_category} (₹{top_amount:.2f})

User Question:
{message}
"""

    if conversation_history:
        past_msgs = conversation_history[-3:]
        formatted = '\n'.join([f"{m.get('role', 'user').capitalize()}: {m.get('content', '')}" for m in past_msgs])
        context += f"\nPrevious conversation:\n{formatted}\n"

    # keep final instruction explicit
    context += "\n\nAnswer naturally. Don't repeat the data unless needed."
    if "why" in message.lower():
        context += "\nExplain reasoning briefly."

    # ✅ TRY OLLAMA FIRST
    reply = _local_ollama_reply(context)

    print("🔥 OLLAMA RETURN:", repr(reply))

    if reply:
        return {
            "reply": reply,
            "mode": "ollama",
            "sources": ["local"],
        }

    return {
        "reply": "Something went wrong. Try again in a moment.",
        "mode": "fallback",
        "sources": ["local"],
    }