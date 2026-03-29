from fastapi import APIRouter

from app.api.routes._legacy import router as legacy_router
from .auth import router as auth_router

router = APIRouter()
router.include_router(legacy_router)
router.include_router(auth_router, prefix="/auth", tags=["auth"])
