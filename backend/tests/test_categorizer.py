"""Purpose: tests for rule-based categorizer fallback."""
from app.ml.categorizer import categorize_text


def test_rule_categorization():
    cat, conf = categorize_text('Payment at Zomato using UPI')
    assert cat == 'food_dining'
    assert conf >= 0.9
