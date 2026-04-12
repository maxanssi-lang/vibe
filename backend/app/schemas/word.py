from pydantic import BaseModel


class TranslationRequest(BaseModel):
    korean: str


class ExampleItem(BaseModel):
    language: str  # "en" | "zh" | "ja"
    sentence: str
    korean_translation: str


class TranslationResponse(BaseModel):
    korean: str
    english: str
    english_pronunciation: str
    chinese: str
    chinese_pronunciation: str
    japanese: str
    japanese_pronunciation: str
    examples: list[ExampleItem]


class ExampleRequest(BaseModel):
    korean: str
    english: str
    chinese: str
    japanese: str
