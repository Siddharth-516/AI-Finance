#!/usr/bin/env python3
"""Purpose: seed demo credentials and sample expenses into configured DB."""
import asyncio
import sys
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parents[1]
BACKEND_PATH = ROOT / 'backend'
if str(BACKEND_PATH) not in sys.path:
    sys.path.insert(0, str(BACKEND_PATH))

from sqlalchemy import select
from app.auth.security import hash_password
from app.db.session import SessionLocal
from app.models.models import Expense, Transaction, User


async def main():
    async with SessionLocal() as db:
        user = await db.scalar(select(User).where(User.email == 'demo@example.com'))
        if not user:
            user = User(name='Demo User', email='demo@example.com', password_hash=hash_password('Demo@12345'))
            db.add(user)
            await db.flush()
            expenses = [
                Expense(user_id=user.id, amount=450, category='food', expense_date=date.today(), description='Lunch'),
                Expense(user_id=user.id, amount=1200, category='rent', expense_date=date.today(), description='Hostel rent part'),
            ]
            txns = [
                Transaction(user_id=user.id, txn_date=date.today(), amount=450, currency='INR', merchant='Cafeteria', category='food', tags=[]),
                Transaction(user_id=user.id, txn_date=date.today(), amount=1200, currency='INR', merchant='Hostel', category='rent', tags=[]),
            ]
            db.add_all(expenses + txns)
            await db.commit()
            print('Seeded demo user, expenses, and transactions.')
        else:
            print('Demo user already exists.')


if __name__ == '__main__':
    asyncio.run(main())
