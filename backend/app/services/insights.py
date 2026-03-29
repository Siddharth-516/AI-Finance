"""Purpose: plain-English monthly insights generator."""
from collections import defaultdict
from statistics import mean


def generate_insights(txns: list[dict]) -> list[str]:
    if not txns:
        return [
            "No expenses yet. Add your first transaction or import SMS to unlock personalized insights.",
            "Educational only — not financial advice.",
            "Start by tracking daily food and transport spending.",
        ]

    by_cat = defaultdict(float)
    amounts = []
    for t in txns:
        amount = float(t.get("amount", 0) or 0)
        amounts.append(amount)
        by_cat[str(t.get("category", "others"))] += amount

    total = sum(amounts)
    top_cat, top_amt = sorted(by_cat.items(), key=lambda x: x[1], reverse=True)[0]
    top_share = (top_amt / total * 100) if total else 0
    avg_txn = mean(amounts) if amounts else 0

    insights = [
        f"You tracked {len(txns)} transactions totaling INR {total:,.0f}.",
        f"Your biggest category is {top_cat}, which is about {top_share:.0f}% of tracked spend.",
    ]

    if top_share >= 30:
        insights.append(f"Consider a weekly cap for {top_cat}; even a 10% cut could improve savings.")
    if avg_txn >= 1000:
        insights.append("Your average transaction size is rising, so small recurring cuts will matter more than one-off cuts.")
    if len(txns) < 5:
        insights.append("More data will make the budget recommendations sharper — keep logging daily spend.")

    insights.append("Educational only — not financial advice.")
    return insights[:4]
