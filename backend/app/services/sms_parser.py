"""Purpose: pluggable SMS parser for Indian banking messages."""
# CODE OWNERSHIP: Data Platform Team
import re
from datetime import datetime
from typing import Any

AMOUNT_REGEX = re.compile(r"(?:(?:INR|Rs|Rs\.)\s?)([0-9,]+(?:\.\d+)?)", re.IGNORECASE)
DATE_REGEXES = [
    re.compile(r"(\d{2}-\d{2}-\d{4})"),
    re.compile(r"(\d{2}/\d{2}/\d{4})"),
    re.compile(r"([A-Za-z]{3}\s\d{1,2})"),
]
MERCHANT_REGEX = re.compile(r"(?:at|to|via)\s([A-Za-z0-9\-_&. ]+)", re.IGNORECASE)

BANK_PATTERNS = {
    "sbi": re.compile(r"SBI|State Bank", re.IGNORECASE),
    "hdfc": re.compile(r"HDFC", re.IGNORECASE),
    "icici": re.compile(r"ICICI", re.IGNORECASE),
    "axis": re.compile(r"AXIS", re.IGNORECASE),
    "phonepe": re.compile(r"PhonePe", re.IGNORECASE),
    "paytm": re.compile(r"Paytm", re.IGNORECASE),
}


def parse_sms_line(text: str) -> dict[str, Any]:
    amount_match = AMOUNT_REGEX.search(text)
    merchant_match = MERCHANT_REGEX.search(text)
    date_value = None
    for regex in DATE_REGEXES:
        m = regex.search(text)
        if m:
            date_value = m.group(1)
            break
    bank = next((name for name, p in BANK_PATTERNS.items() if p.search(text)), "generic")
    return {
        "bank": bank,
        "amount": float(amount_match.group(1).replace(",", "")) if amount_match else None,
        "merchant": merchant_match.group(1).strip() if merchant_match else None,
        "txn_date": date_value,
        "raw_text": text,
    }


def parse_bulk_sms(items: list[str]) -> list[dict[str, Any]]:
    return [parse_sms_line(item) for item in items]
