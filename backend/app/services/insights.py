"""Purpose: plain-English monthly insights generator."""
from collections import defaultdict


def generate_insights(txns: list[dict]) -> list[str]:
    by_cat = defaultdict(float)
    for t in txns:
        by_cat[t.get("category", "others")] += float(t.get("amount", 0))
    top = sorted(by_cat.items(), key=lambda x: x[1], reverse=True)
    insights = []
    if top:
        insights.append(f"Top category this period was {top[0][0]} at INR {top[0][1]:.2f}.")
    insights.append("You can improve your saving rate by moving discretionary spending into a fixed weekly budget.")
    insights.append("Educational only — not financial advice.")
    return insights[:3]
