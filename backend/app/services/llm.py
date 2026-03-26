"""Purpose: LLM prompt templates and response wrapper with real provider integration + fallback."""
from __future__ import annotations
from typing import Any
from app.core.config import settings

EXPENSE_PROMPT = '''You are an assistant that maps a single transaction text to one of the following categories:
[groceries, food_dining, transport, utilities, rent, entertainment, healthcare, education, subscriptions, salary, refund, others]
Return only JSON: {"category": "<category>", "confidence": 0.00, "reason": "<one-line reason>"}
Transaction text: "<raw_text>"'''

COACH_PROMPT = '''You are a friendly, concise financial coach for young adults. Answer the user's question in plain English with 2–4 short paragraphs. Include:
- A short actionable recommendation (1-3 bullet points).
- A “Why” sentence that explains the logic.
- A short educational note (1–2 sentences) that clarifies any investing term used.
- A final line: "Educational only — not financial advice."

User context:
- monthly_income: <income>
- risk_level: <low|medium|high>
- savings_balance: <amount>

Question: "<user_message>"'''

SAFETY_GUARD = "If the LLM says anything that sounds like an absolute financial claim, append: \"I might be wrong — verify with a certified advisor.\" Also include sources where possible."


def _fallback_reply(risk_level: str, income: str) -> dict[str, Any]:
    text = (
        f"Based on your profile ({risk_level}), keep expenses below 70% of income band {income}.\n"
        "- Automate monthly savings on salary day\n- Build emergency corpus first\n"
        "Why: automation reduces impulse spending.\n"
        "A SIP is a recurring investment into a mutual fund at fixed intervals.\n"
        "Educational only — not financial advice."
    )
    return {
        "reply": text,
        "sources": ["RBI consumer awareness", "SEBI investor education"],
        "mode": "heuristic_fallback",
    }


def coach_reply(message: str, risk_level: str, income: str) -> dict[str, Any]:
    if not settings.openai_api_key:
        return _fallback_reply(risk_level, income)

    try:
        from openai import OpenAI

        client = OpenAI(api_key=settings.openai_api_key)
        prompt = COACH_PROMPT.replace('<income>', income).replace('<low|medium|high>', risk_level).replace('<amount>', '0').replace('<user_message>', message)
        res = client.responses.create(model='gpt-4.1-mini', input=[{'role': 'system', 'content': SAFETY_GUARD}, {'role': 'user', 'content': prompt}])
        text = res.output_text.strip()
        if 'Educational only — not financial advice.' not in text:
            text += '\nEducational only — not financial advice.'
        return {'reply': text, 'sources': ['OpenAI response'], 'mode': 'llm'}
    except Exception:
        return _fallback_reply(risk_level, income)
