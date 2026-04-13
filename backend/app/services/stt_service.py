import base64
import json

import httpx

from app.core.config import settings

LANGUAGE_MAP = {
    "en": "en-US",
    "zh": "zh-CN",
    "ja": "ja-JP",
}


def evaluate(audio_bytes: bytes, reference_text: str, language: str) -> dict:
    if language not in LANGUAGE_MAP:
        raise ValueError(f"지원하지 않는 언어: {language}")

    locale = LANGUAGE_MAP[language]

    # Pronunciation Assessment 설정 (Base64 인코딩)
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
                "Content-Type": "audio/webm;codecs=opus",
                "Pronunciation-Assessment": config_b64,
            },
            content=audio_bytes,
        )

    if resp.status_code != 200:
        return {
            "score": 0,
            "accuracy_score": 0,
            "fluency_score": 0,
            "completeness_score": 0,
            "words": [],
            "recognized_text": "",
        }

    data = resp.json()
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
