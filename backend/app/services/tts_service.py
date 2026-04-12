import azure.cognitiveservices.speech as speechsdk

from app.core.config import settings

# 언어별 Azure TTS 음성 설정
VOICE_MAP = {
    "en": "en-US-JennyNeural",
    "zh": "zh-CN-XiaoxiaoNeural",
    "ja": "ja-JP-NanamiNeural",
}

# 속도별 SSML rate 값
SPEED_MAP = {
    "normal": "1.0",
    "slow": "0.7",
}


def synthesize(text: str, language: str, speed: str = "normal") -> bytes:
    """텍스트를 음성으로 변환하여 WAV 바이트 반환."""
    if language not in VOICE_MAP:
        raise ValueError(f"지원하지 않는 언어: {language}")

    voice = VOICE_MAP[language]
    rate = SPEED_MAP.get(speed, "1.0")

    speech_config = speechsdk.SpeechConfig(
        subscription=settings.AZURE_SPEECH_KEY,
        region=settings.AZURE_SPEECH_REGION,
    )
    speech_config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
    )

    ssml = f"""<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='{language}'>
  <voice name='{voice}'>
    <prosody rate='{rate}'>{text}</prosody>
  </voice>
</speak>"""

    synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=None)
    result = synthesizer.speak_ssml_async(ssml).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        return result.audio_data

    raise RuntimeError(f"TTS 실패: {result.reason}")
