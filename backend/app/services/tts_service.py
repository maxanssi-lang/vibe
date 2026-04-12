import httpx

from app.core.config import settings

VOICE_MAP = {
    "en": "en-US-JennyNeural",
    "zh": "zh-CN-XiaoxiaoNeural",
    "ja": "ja-JP-NanamiNeural",
}

SPEED_MAP = {
    "normal": "1.0",
    "slow": "0.7",
}


def _get_token() -> str:
    url = f"https://{settings.AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken"
    with httpx.Client() as client:
        resp = client.post(url, headers={"Ocp-Apim-Subscription-Key": settings.AZURE_SPEECH_KEY})
        resp.raise_for_status()
        return resp.text


def synthesize(text: str, language: str, speed: str = "normal") -> bytes:
    if language not in VOICE_MAP:
        raise ValueError(f"지원하지 않는 언어: {language}")

    voice = VOICE_MAP[language]
    rate = SPEED_MAP.get(speed, "1.0")
    token = _get_token()

    ssml = f"""<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='{language}'>
  <voice name='{voice}'>
    <prosody rate='{rate}'>{text}</prosody>
  </voice>
</speak>"""

    url = f"https://{settings.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1"
    with httpx.Client(timeout=15) as client:
        resp = client.post(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/ssml+xml",
                "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
            },
            content=ssml.encode("utf-8"),
        )
        resp.raise_for_status()
        return resp.content
