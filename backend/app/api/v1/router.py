from fastapi import APIRouter

from app.api.v1.endpoints import pronunciation, words

router = APIRouter()

router.include_router(words.router)
router.include_router(pronunciation.router)
