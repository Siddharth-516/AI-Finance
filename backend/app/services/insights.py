"""Purpose: plain-English monthly insights generator with deterministic fallback."""
from collections import defaultdict


def generate_insights(txns: list[dict]) -> list[str]:
    by_cat = defaultdict(float)
    total = 0.0
    for t in txns:
        amount = float(t.get("amount", 0))
        total += amount
        by_cat[t.get("category", "others")] += amount

    top = sorted(by_cat.items(), key=lambda x: x[1], reverse=True)
    if not txns:
        return [
            "No expenses yet. Add your first expense to receive personalized insights.",
            "Educational only — not financial advice.",
            "Start by tracking daily food and transport spending.",
        ]

    insights = []
    if top:
        share = (top[0][1] / total * 100) if total else 0
        insights.append(f"Top category this period was {top[0][0]} at INR {top[0][1]:.2f} ({share:.1f}% of spend).")
    insights.append("Set category budgets for your top 2 spend buckets to improve savings consistency.")
    insights.append("Educational only — not financial advice.")
    return insights[:3]
