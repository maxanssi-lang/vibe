from pydantic import BaseModel


class TTSRequest(BaseModel):
    text: str
    language: str  # "en" | "zh" | "ja"
    speed: str = "normal"  # "normal" | "slow"
