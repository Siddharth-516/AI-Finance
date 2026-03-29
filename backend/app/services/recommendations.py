"""Purpose: budget and investment educational recommendations."""


def savings_recommendation(income_range: str, risk_level: str) -> dict:
    lower = 0
    try:
        lower = int((income_range or '0-0').split('-')[0].replace(',', '').strip())
    except Exception:
        lower = 0

    if lower >= 50000:
        essentials, savings, flexible = 50, 30, 20
    elif lower >= 25000:
        essentials, savings, flexible = 45, 25, 30
    else:
        essentials, savings, flexible = 55, 20, 25

    if risk_level == 'high':
        savings = min(35, savings + 5)
    elif risk_level == 'low':
        savings = max(20, savings - 0)

    return {
        'allocation': {'essentials': essentials, 'savings': savings, 'flexible': flexible},
        'plan': [
            'Create a 3-6 month emergency fund.',
            'Start a monthly SIP in a low-cost index fund after your emergency fund is in place.',
            'Review spending weekly and auto-transfer savings right after salary credit.',
        ],
        'risk_level': risk_level,
        'disclaimer': 'Educational only — not financial advice.',
    }
