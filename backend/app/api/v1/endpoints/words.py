from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.schemas.word import TranslationRequest, TranslationResponse
from app.services import word_service

router = APIRouter(prefix="/words", tags=["words"])


@router.post("/translate", response_model=TranslationResponse)
def translate(request: TranslationRequest, db: Session = Depends(get_db)):
    korean = request.korean.strip()
    if not korean:
        raise HTTPException(status_code=400, detail="단어를 입력해 주세요.")
    if len(korean) > 20:
        raise HTTPException(status_code=400, detail="20자 이하로 입력해 주세요.")

    return word_service.get_or_create_translation(korean, db)
