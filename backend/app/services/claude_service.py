import json

import anthropic

from app.core.config import settings
from app.schemas.word import ExampleItem, TranslationResponse

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """You are a multilingual dictionary assistant.
Always respond with valid JSON only. No markdown, no explanation."""

TRANSLATE_PROMPT = """Translate the Korean word "{korean}" into English, Chinese, and Japanese.

Return exactly this JSON structure:
{{
  "english": "translation",
  "english_pronunciation": "IPA notation, e.g. /lʌv/",
  "chinese": "translation",
  "chinese_pronunciation": "pinyin with tone marks, e.g. ài",
  "japanese": "translation",
  "japanese_pronunciation": "hiragana, e.g. あい"
}}"""

EXAMPLE_PROMPT = """Generate one very simple example sentence for each language using the given word translations.
Each sentence should be kindergarten level: short (3-7 words), simple vocabulary, easy to understand for a child.

Word: {korean} (EN: {english}, ZH: {chinese}, JA: {japanese})

Return exactly this JSON structure:
{{
  "examples": [
    {{
      "language": "en",
      "sentence": "English example sentence.",
      "korean_translation": "한국어 해석"
    }},
    {{
      "language": "zh",
      "sentence": "中文例句。",
      "korean_translation": "한국어 해석"
    }},
    {{
      "language": "ja",
      "sentence": "日本語の例文。",
      "korean_translation": "한국어 해석"
    }}
  ]
}}"""


def _call_claude(prompt: str) -> dict:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    text = message.content[0].text.strip()
    return json.loads(text)


def translate(korean: str) -> TranslationResponse:
    prompt = TRANSLATE_PROMPT.format(korean=korean)
    data = _call_claude(prompt)

    example_prompt = EXAMPLE_PROMPT.format(
        korean=korean,
        english=data["english"],
        chinese=data["chinese"],
        japanese=data["japanese"],
    )
    example_data = _call_claude(example_prompt)

    return TranslationResponse(
        korean=korean,
        english=data["english"],
        english_pronunciation=data["english_pronunciation"],
        chinese=data["chinese"],
        chinese_pronunciation=data["chinese_pronunciation"],
        japanese=data["japanese"],
        japanese_pronunciation=data["japanese_pronunciation"],
        examples=[ExampleItem(**ex) for ex in example_data["examples"]],
    )


def generate_examples(korean: str, english: str, chinese: str, japanese: str) -> list[ExampleItem]:
    prompt = EXAMPLE_PROMPT.format(
        korean=korean,
        english=english,
        chinese=chinese,
        japanese=japanese,
    )
    data = _call_claude(prompt)
    return [ExampleItem(**ex) for ex in data["examples"]]
