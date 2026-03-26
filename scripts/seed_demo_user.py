#!/usr/bin/env python3
"""Purpose: seed demo credentials and sample expenses into configured DB."""
import asyncio
from datetime import date
from sqlalchemy import select
from app.auth.security import hash_password
from app.db.session import SessionLocal
from app.models.models import Expense, User


async def main():
    async with SessionLocal() as db:
        user = await db.scalar(select(User).where(User.email == 'demo@example.com'))
        if not user:
            user = User(name='Demo User', email='demo@example.com', password_hash=hash_password('Demo@12345'))
            db.add(user)
            await db.flush()
            db.add_all(
                [
                    Expense(user_id=user.id, amount=450, category='food', expense_date=date.today(), description='Lunch'),
                    Expense(user_id=user.id, amount=1200, category='rent', expense_date=date.today(), description='Hostel rent part'),
                ]
            )
            await db.commit()
            print('Seeded demo user and expenses.')
        else:
            print('Demo user already exists.')


if __name__ == '__main__':
    asyncio.run(main())
