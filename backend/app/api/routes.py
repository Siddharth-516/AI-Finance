"""Purpose: API routers for auth, transactions, chat, insights, and admin."""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.deps import get_current_user
from app.auth.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.db.session import get_db
from app.ml.categorizer import categorize_text
from app.models.models import Transaction, User, ModelRegistry
from app.schemas.schemas import ChatRequest, LoginRequest, RegisterRequest, SMSImportRequest, TokenPair, TransactionIn, UserOut, RiskQuizRequest
from app.services.insights import generate_insights
from app.services.llm import coach_reply
from app.services.recommendations import savings_recommendation
from app.services.sms_parser import parse_bulk_sms

router = APIRouter()


@router.post('/auth/register', response_model=TokenPair)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    exists = await db.scalar(select(User).where(User.email == payload.email))
    if exists:
        raise HTTPException(status_code=400, detail='Email already exists')
    user = User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password), timezone=payload.timezone, currency=payload.currency, income_range=payload.income_range)
    db.add(user)
    await db.commit()
    return TokenPair(access_token=create_access_token(payload.email), refresh_token=create_refresh_token(payload.email))


@router.post('/auth/login', response_model=TokenPair)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    return TokenPair(access_token=create_access_token(user.email), refresh_token=create_refresh_token(user.email))


@router.get('/user/me', response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return UserOut.model_validate(user, from_attributes=True)


@router.post('/onboarding/risk-quiz')
async def risk_quiz(payload: RiskQuizRequest, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    score = sum(payload.answers)
    risk_level = 'low' if score <= 20 else 'medium' if score <= 35 else 'high'
    user.risk_level = risk_level
    await db.commit()
    return {'risk_level': risk_level}


@router.post('/transactions/import/sms')
async def import_sms(payload: SMSImportRequest, user=Depends(get_current_user)):
    if not payload.consent:
        raise HTTPException(status_code=400, detail='Explicit consent is required before parsing SMS')
    parsed = parse_bulk_sms(payload.items)
    for item in parsed:
        category, confidence = categorize_text(item.get('raw_text', ''))
        item['category'] = category
        item['confidence'] = confidence
    return {'preview': parsed, 'count': len(parsed)}


@router.post('/transactions')
async def create_txn(payload: TransactionIn, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):

    duplicate = await db.scalar(select(Transaction).where(and_(Transaction.user_id == user.id, Transaction.txn_date == payload.txn_date, Transaction.amount == payload.amount, Transaction.merchant == payload.merchant)))
    if duplicate:
        raise HTTPException(status_code=400, detail='Potential duplicate transaction detected')
    txn = Transaction(user_id=user.id, txn_date=payload.txn_date, amount=payload.amount, currency=payload.currency, merchant=payload.merchant, category=payload.category, raw_text=payload.notes, tags=payload.tags)
    db.add(txn)
    await db.commit()
    return {'id': str(txn.id)}


@router.get('/transactions')
async def list_txns(from_date: date, to: date, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = await db.scalars(select(Transaction).where(Transaction.user_id == user.id, Transaction.txn_date >= from_date, Transaction.txn_date <= to))
    return [
        {'id': str(t.id), 'amount': float(t.amount), 'merchant': t.merchant, 'category': t.category, 'txn_date': str(t.txn_date)} for t in rows
    ]


@router.get('/insights')
async def insights(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = await db.scalars(select(Transaction).where(Transaction.user_id == user.id))
    txns = [{'amount': float(r.amount), 'category': r.category} for r in rows]
    return {'items': generate_insights(txns)}


@router.post('/chat')
async def chat(payload: ChatRequest, user=Depends(get_current_user)):
    return coach_reply(payload.message, user.risk_level, user.income_range)


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
    rows = await db.scalars(select(Transaction).where(Transaction.user_id == user.id))
    return {'transactions': [{'amount': float(r.amount), 'txn_date': str(r.txn_date), 'category': r.category} for r in rows]}


@router.delete('/privacy/delete')
async def privacy_delete(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.delete(user)
    await db.commit()
    return {'status': 'deleted'}
