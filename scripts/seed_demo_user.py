#!/usr/bin/env python3
"""Purpose: seed a demo user and sample transactions into the local database."""
from __future__ import annotations

import asyncio
from datetime import date
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = ROOT / 'backend'
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from sqlalchemy import select

from app.auth.security import hash_password
from app.db.session import SessionLocal, engine
from app.models.base import Base
import app.models.models  # noqa: F401
from app.models.models import Transaction, User


DEMO_USER = {
    'name': 'Demo User',
    'email': 'demo@example.com',
    'password_hash': hash_password('Demo@12345'),
    'timezone': 'Asia/Kolkata',
    'currency': 'INR',
    'income_range': '25000-50000',
    'risk_level': 'medium',
}

SAMPLE_TXNS = [
    {'txn_date': date.today().replace(day=1), 'amount': 230.0, 'merchant': 'Swiggy', 'category': 'food_dining', 'raw_text': 'HDFC Bank: INR 230 paid at Swiggy on 12-04-2025'},
    {'txn_date': date.today().replace(day=2), 'amount': 850.0, 'merchant': 'Uber', 'category': 'transport', 'raw_text': 'SBI alert: Rs. 850 debited via UPI to Uber on 13/04/2025'},
]


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        user = await db.scalar(select(User).where(User.email == DEMO_USER['email']))
        if not user:
            user = User(**DEMO_USER)
            db.add(user)
            await db.flush()

        existing = await db.scalar(select(Transaction.id).where(Transaction.user_id == user.id))
        if not existing:
            for row in SAMPLE_TXNS:
                db.add(Transaction(user_id=user.id, currency='INR', **row))

        await db.commit()
        print('Seeded demo user and sample transactions: demo@example.com / Demo@12345')


if __name__ == '__main__':
    asyncio.run(seed())
