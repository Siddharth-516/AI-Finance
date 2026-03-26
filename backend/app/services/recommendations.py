"""Purpose: budget and investment educational recommendations."""


def savings_recommendation(income_range: str, risk_level: str) -> dict:
    return {
        "allocation": {"essentials": 30, "savings": 30, "flexible": 40},
        "plan": [
            "Create a 3-6 month emergency fund.",
            "Start a monthly SIP in a low-cost index fund.",
            "Review spending weekly and auto-transfer savings after salary credit.",
        ],
        "risk_level": risk_level,
        "disclaimer": "Educational only — not financial advice.",
    }
