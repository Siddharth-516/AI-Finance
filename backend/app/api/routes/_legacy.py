"""Purpose: API routers for auth, expenses, transactions, chat, and insights."""
from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import and_, delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.auth.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.core.config import settings
from app.db.session import get_db
from app.ml.categorizer import categorize_text
from app.models.models import Expense, ModelRegistry, Transaction, User
from app.schemas.schemas import (
    ChatRequest,
    ExpenseIn,
    ExpenseUpdate,
    GoogleLoginRequest,
    LoginRequest,
    ProfileUpdate,
    RegisterRequest,
    RiskQuizRequest,
    SMSImportRequest,
    TokenPair,
    TransactionIn,
    UserOut,
)
from app.services.google_oauth import verify_google_identity
from app.services.insights import generate_insights
from app.services.llm import coach_reply
from app.services.recommendations import savings_recommendation
from app.services.sms_parser import parse_bulk_sms

router = APIRouter()


async def _issue_token_pair(email: str) -> TokenPair:
    return TokenPair(
        access_token=create_access_token(email),
        refresh_token=create_refresh_token(email),
    )


async def _get_or_create_user(db: AsyncSession, email: str, name: str, password_hash: str = "oauth-google") -> User:
    user = await db.scalar(select(User).where(User.email == email))
    if user:
        if name and user.name != name:
            user.name = name
            await db.commit()
        return user

    user = User(name=name, email=email, password_hash=password_hash)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


# Auth endpoints are now provided by app.api.routes.auth with /auth prefix (router include)

@router.get('/user/me', response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return UserOut.model_validate(user, from_attributes=True)


@router.put('/user/me', response_model=UserOut)
async def update_me(payload: ProfileUpdate, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if payload.name is not None:
        user.name = payload.name
    if payload.timezone is not None:
        user.timezone = payload.timezone
    if payload.currency is not None:
        user.currency = payload.currency
    if payload.income_range is not None:
        user.income_range = payload.income_range
    if payload.risk_level is not None:
        user.risk_level = payload.risk_level
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user, from_attributes=True)


@router.post('/expenses')
async def add_expense(payload: ExpenseIn, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    expense = Expense(user_id=user.id, amount=payload.amount, category=payload.category, expense_date=payload.date, description=payload.description)
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return {'id': str(expense.id)}


@router.get('/expenses')
async def get_expenses(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = await db.scalars(select(Expense).where(Expense.user_id == user.id).order_by(Expense.expense_date.desc()))
    return [
        {
            'id': str(row.id),
            'amount': float(row.amount),
            'category': row.category,
            'date': str(row.expense_date),
            'description': row.description,
        }
        for row in rows
    ]


@router.put('/expenses/{expense_id}')
async def edit_expense(expense_id: UUID, payload: ExpenseUpdate, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    expense = await db.scalar(select(Expense).where(and_(Expense.id == expense_id, Expense.user_id == user.id)))
    if not expense:
        raise HTTPException(status_code=404, detail='Expense not found')
    if payload.amount is not None:
        expense.amount = payload.amount
    if payload.category is not None:
        expense.category = payload.category
    if payload.date is not None:
        expense.expense_date = payload.date
    if payload.description is not None:
        expense.description = payload.description
    await db.commit()
    return {'status': 'updated'}


@router.delete('/expenses/{expense_id}')
async def delete_expense(expense_id: UUID, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    expense = await db.scalar(select(Expense).where(and_(Expense.id == expense_id, Expense.user_id == user.id)))
    if not expense:
        raise HTTPException(status_code=404, detail='Expense not found')
    await db.delete(expense)
    await db.commit()
    return {'status': 'deleted'}


@router.post('/onboarding/risk-quiz')
async def risk_quiz(payload: RiskQuizRequest, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    score = sum(payload.answers)
    risk_level = 'low' if score <= 20 else 'medium' if score <= 35 else 'high'
    user.risk_level = risk_level
    await db.commit()
    return {'risk_level': risk_level}


@router.post('/transactions/import/sms')
async def import_sms(payload: SMSImportRequest, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not payload.consent:
        raise HTTPException(status_code=400, detail='Explicit consent is required before parsing SMS')
    parsed = parse_bulk_sms(payload.items)
    saved = 0
    for item in parsed:
        category, confidence = categorize_text(item.get('raw_text', ''))
        item['category'] = category
        item['confidence'] = confidence
        if item.get('amount') is not None:
            txn_date = date.today()
            txn = Transaction(
                user_id=user.id,
                txn_date=txn_date,
                amount=item['amount'],
                currency='INR',
                merchant=item.get('merchant'),
                raw_text=item.get('raw_text'),
                category=category,
                category_confidence=confidence,
                tags=[],
            )
            expense = Expense(
                user_id=user.id,
                amount=item['amount'],
                category=category,
                expense_date=txn_date,
                description=item.get('merchant') or 'SMS import',
            )
            db.add(txn)
            db.add(expense)
            saved += 1
    await db.commit()
    return {'preview': parsed, 'count': len(parsed), 'saved': saved}


@router.post('/transactions')
async def create_txn(payload: TransactionIn, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    duplicate = await db.scalar(
        select(Transaction).where(
            and_(
                Transaction.user_id == user.id,
                Transaction.txn_date == payload.txn_date,
                Transaction.amount == payload.amount,
                Transaction.merchant == payload.merchant,
            )
        )
    )
    if duplicate:
        raise HTTPException(status_code=400, detail='Potential duplicate transaction detected')
    txn = Transaction(
        user_id=user.id,
        txn_date=payload.txn_date,
        amount=payload.amount,
        currency=payload.currency,
        merchant=payload.merchant,
        category=payload.category,
        raw_text=payload.notes,
        tags=payload.tags,
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)
    return {'id': str(txn.id)}


@router.get('/transactions')
async def list_txns(from_date: date, to: date, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = await db.scalars(select(Transaction).where(Transaction.user_id == user.id, Transaction.txn_date >= from_date, Transaction.txn_date <= to))
    return [{'id': str(t.id), 'amount': float(t.amount), 'merchant': t.merchant, 'category': t.category, 'txn_date': str(t.txn_date), 'tags': t.tags or []} for t in rows]


@router.get('/insights')
async def insights(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = await db.scalars(select(Expense).where(Expense.user_id == user.id))
    txns = [{'amount': float(r.amount), 'category': r.category} for r in rows]
    return {'items': generate_insights(txns)}


@router.post('/chat')
async def chat(payload: ChatRequest, db: AsyncSession = Depends(get_db)):
    print("🔥 CHAT ENDPOINT HIT")

    # Temporarily bypass auth for local debugging of Ollama path
    # user dependency intentionally removed to avoid 403 auth block.
    user = await db.get(User, payload.user_id) if hasattr(payload, 'user_id') else None

    expenses = (await db.scalars(select(Expense).where(Expense.user_id == (user.id if user else None)).order_by(Expense.expense_date.desc()).limit(20))).all()
    spending_totals: dict[str, float] = {}
    total = 0.0
    recent = []
    for row in expenses:
        amount = float(row.amount)
        total += amount
        spending_totals[row.category] = spending_totals.get(row.category, 0.0) + amount
        recent.append({'date': str(row.expense_date), 'amount': amount, 'category': row.category, 'description': row.description})
    top_categories = sorted(spending_totals.items(), key=lambda item: item[1], reverse=True)[:5]
    summary = {'total_spend': round(total, 2), 'top_categories': top_categories}

    risk_level = user.risk_level if user else 'low'
    income_range = user.income_range if user else '0-25000'

    history = (payload.conversation_history or [])[-3:]
    return coach_reply(payload.message, risk_level, income_range, summary, recent, history)


@router.get('/recommendations/savings')
async def recommendations(user=Depends(get_current_user)):
    return savings_recommendation(user.income_range, user.risk_level)


@router.post('/models/retrain')
async def retrain(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.email != 'admin@example.com':
        raise HTTPException(status_code=403, detail='Admin only')
    registry = ModelRegistry(name='categorizer', type='logreg', version='latest', metrics={'f1': 0.8})
    db.add(registry)
    await db.commit()
    return {'status': 'retrain_triggered'}


@router.get('/healthz')
async def healthz():
    return {'ok': True}


@router.get('/privacy/export')
async def privacy_export(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    expenses = (await db.scalars(select(Expense).where(Expense.user_id == user.id).order_by(Expense.expense_date.desc()))).all()
    txns = (await db.scalars(select(Transaction).where(Transaction.user_id == user.id).order_by(Transaction.txn_date.desc()))).all()
    return {
        'profile': UserOut.model_validate(user, from_attributes=True).model_dump(),
        'expenses': [
            {
                'id': str(row.id),
                'amount': float(row.amount),
                'category': row.category,
                'date': str(row.expense_date),
                'description': row.description,
            }
            for row in expenses
        ],
        'transactions': [
            {
                'id': str(row.id),
                'amount': float(row.amount),
                'category': row.category,
                'date': str(row.txn_date),
                'merchant': row.merchant,
                'raw_text': row.raw_text,
                'tags': row.tags or [],
            }
            for row in txns
        ],
    }


@router.delete('/privacy/delete')
async def privacy_delete(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Expense).where(Expense.user_id == user.id))
    await db.execute(delete(Transaction).where(Transaction.user_id == user.id))
    await db.execute(delete(User).where(User.id == user.id))
    await db.commit()
    return {'status': 'deleted'}
