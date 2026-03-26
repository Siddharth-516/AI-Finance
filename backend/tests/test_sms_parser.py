"""Purpose: tests for SMS parser."""
from app.services.sms_parser import parse_sms_line


def test_parse_sms_line_extracts_amount_and_merchant():
    text = 'Your A/c 12XX debited by INR 1,250.00 at Zomato on 12-02-2026'
    row = parse_sms_line(text)
    assert row['amount'] == 1250.0
    assert 'Zomato' in (row['merchant'] or '')
