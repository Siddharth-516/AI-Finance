"""Purpose: Transaction categorization using rule + ML fallback."""
# CODE OWNERSHIP: ML Team
from pathlib import Path
import joblib

RULES = {
    "zomato": "food_dining",
    "swiggy": "food_dining",
    "salary": "salary",
    "uber": "transport",
    "netflix": "subscriptions",
}

MODEL_PATH = Path("backend/app/ml/model.joblib")


def categorize_text(raw_text: str) -> tuple[str, float]:
    lower = raw_text.lower()
    for token, cat in RULES.items():
        if token in lower:
            return cat, 0.95
    if MODEL_PATH.exists():
        model = joblib.load(MODEL_PATH)
        pred = model.predict([raw_text])[0]
        conf = float(max(model.predict_proba([raw_text])[0]))
        return pred, conf
    return "others", 0.4
