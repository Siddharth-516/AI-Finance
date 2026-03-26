"""Purpose: FastAPI application entrypoint."""
import time
import uuid
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.routes import router
from app.core.config import settings

app = FastAPI(title='AI Financial Companion', version='0.1.0')
app.include_router(router, prefix=settings.api_prefix)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(',')],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

_requests = defaultdict(list)


@app.middleware('http')
async def correlation_and_rate_limit(request: Request, call_next):
    corr = request.headers.get('x-correlation-id', str(uuid.uuid4()))
    now = time.time()
    ip = request.client.host if request.client else 'unknown'
    _requests[ip] = [t for t in _requests[ip] if now - t < 60]
    if len(_requests[ip]) >= settings.rate_limit_per_minute:
        return JSONResponse(status_code=429, content={'detail': 'Rate limit exceeded', 'correlation_id': corr})
    _requests[ip].append(now)
    response = await call_next(request)
    response.headers['x-correlation-id'] = corr
    return response
