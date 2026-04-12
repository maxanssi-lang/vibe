from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import Response

from app.schemas.pronunciation import TTSRequest
from app.services import tts_service, stt_service

router = APIRouter(prefix="/pronunciation", tags=["pronunciation"])


@router.post("/tts")
def text_to_speech(request: TTSRequest):
    if request.language not in ("en", "zh", "ja"):
        raise HTTPException(status_code=400, detail="language는 en, zh, ja 중 하나여야 합니다.")
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="text를 입력해 주세요.")
    if request.speed not in ("normal", "slow"):
        raise HTTPException(status_code=400, detail="speed는 normal 또는 slow여야 합니다.")

    audio = tts_service.synthesize(request.text, request.language, request.speed)
    return Response(content=audio, media_type="audio/mpeg")


@router.post("/evaluate")
async def evaluate_pronunciation(
    audio: UploadFile = File(...),
    reference_text: str = Form(...),
    language: str = Form(...),
):
    if language not in ("en", "zh", "ja"):
        raise HTTPException(status_code=400, detail="language는 en, zh, ja 중 하나여야 합니다.")

    audio_bytes = await audio.read()
    result = stt_service.evaluate(audio_bytes, reference_text, language)
    return result
