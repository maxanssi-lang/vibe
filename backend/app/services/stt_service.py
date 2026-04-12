import io
import wave

import azure.cognitiveservices.speech as speechsdk

from app.core.config import settings

LANGUAGE_MAP = {
    "en": "en-US",
    "zh": "zh-CN",
    "ja": "ja-JP",
}


def evaluate(audio_bytes: bytes, reference_text: str, language: str) -> dict:
    """사용자 음성의 발음 정확도를 평가하여 점수와 음소별 피드백 반환."""
    if language not in LANGUAGE_MAP:
        raise ValueError(f"지원하지 않는 언어: {language}")

    locale = LANGUAGE_MAP[language]

    speech_config = speechsdk.SpeechConfig(
        subscription=settings.AZURE_SPEECH_KEY,
        region=settings.AZURE_SPEECH_REGION,
    )
    speech_config.speech_recognition_language = locale

    # Pronunciation Assessment 설정
    pronunciation_config = speechsdk.PronunciationAssessmentConfig(
        reference_text=reference_text,
        grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
        granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
        enable_miscue=True,
    )

    audio_stream = speechsdk.audio.PushAudioInputStream()
    audio_config = speechsdk.audio.AudioConfig(stream=audio_stream)

    recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
    pronunciation_config.apply_to(recognizer)

    audio_stream.write(audio_bytes)
    audio_stream.close()

    result = recognizer.recognize_once_async().get()

    if result.reason != speechsdk.ResultReason.RecognizedSpeech:
        return {
            "score": 0,
            "accuracy_score": 0,
            "fluency_score": 0,
            "completeness_score": 0,
            "words": [],
            "recognized_text": "",
        }

    assessment = speechsdk.PronunciationAssessmentResult(result)

    words = []
    for word in assessment.words:
        phonemes = []
        for phoneme in word.phonemes:
            phonemes.append({
                "phoneme": phoneme.phoneme,
                "score": round(phoneme.accuracy_score),
            })
        words.append({
            "word": word.word,
            "score": round(word.accuracy_score),
            "error_type": word.error_type,
            "phonemes": phonemes,
        })

    return {
        "score": round(assessment.pronunciation_score),
        "accuracy_score": round(assessment.accuracy_score),
        "fluency_score": round(assessment.fluency_score),
        "completeness_score": round(assessment.completeness_score),
        "words": words,
        "recognized_text": result.text,
    }
