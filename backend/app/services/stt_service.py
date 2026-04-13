import base64
import json
import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

LANGUAGE_MAP = {
    "en": "en-US",
    "zh": "zh-CN",
    "ja": "ja-JP",
}


def evaluate(audio_bytes: bytes, reference_text: str, language: str) -> dict:
    if language not in LANGUAGE_MAP:
        raise ValueError(f"지원하지 않는 언어: {language}")

    locale = LANGUAGE_MAP[language]

    assessment_config = {
        "ReferenceText": reference_text,
        "GradingSystem": "HundredMark",
        "Granularity": "Phoneme",
        "EnableMiscue": True,
    }
    config_json = json.dumps(assessment_config)
    config_b64 = base64.b64encode(config_json.encode("utf-8")).decode("utf-8")

    url = (
        f"https://{settings.AZURE_SPEECH_REGION}.stt.speech.microsoft.com"
        f"/speech/recognition/conversation/cognitiveservices/v1"
        f"?language={locale}&format=detailed"
    )

    with httpx.Client(timeout=30) as client:
        resp = client.post(
            url,
            headers={
                "Ocp-Apim-Subscription-Key": settings.AZURE_SPEECH_KEY,
                "Content-Type": "audio/ogg; codecs=opus",
                "Pronunciation-Assessment": config_b64,
            },
            content=audio_bytes,
        )

    logger.info(f"Azure STT status: {resp.status_code}")
    logger.info(f"Azure STT response: {resp.text[:500]}")

    if resp.status_code != 200:
        logger.error(f"Azure STT error: {resp.status_code} {resp.text}")
        return _empty_result()

    try:
        data = resp.json()
    except Exception as e:
        logger.error(f"JSON parse error: {e}, body: {resp.text[:500]}")
        return _empty_result()

    recognition_status = data.get("RecognitionStatus", "")
    if recognition_status != "Success":
        logger.warning(f"Recognition failed: {recognition_status}")
        return _empty_result()

    nbest = data.get("NBest", [{}])[0]
    pa = nbest.get("PronunciationAssessment", {})

    words = []
    for w in nbest.get("Words", []):
        w_pa = w.get("PronunciationAssessment", {})
        phonemes = [
            {"phoneme": p.get("Phoneme", ""), "score": round(p.get("PronunciationAssessment", {}).get("AccuracyScore", 0))}
            for p in w.get("Phonemes", [])
        ]
        words.append({
            "word": w.get("Word", ""),
            "score": round(w_pa.get("AccuracyScore", 0)),
            "error_type": w_pa.get("ErrorType", "None"),
            "phonemes": phonemes,
        })

    return {
        "score": round(pa.get("PronunciationScore", 0)),
        "accuracy_score": round(pa.get("AccuracyScore", 0)),
        "fluency_score": round(pa.get("FluencyScore", 0)),
        "completeness_score": round(pa.get("CompletenessScore", 0)),
        "words": words,
        "recognized_text": data.get("DisplayText", ""),
    }


def _empty_result() -> dict:
    return {
        "score": 0,
        "accuracy_score": 0,
        "fluency_score": 0,
        "completeness_score": 0,
        "words": [],
        "recognized_text": "",
    }
