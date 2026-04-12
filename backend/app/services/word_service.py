from sqlalchemy.orm import Session

from app.models.word import Example, Word
from app.schemas.word import TranslationResponse
from app.services import claude_service


def get_or_create_translation(korean: str, db: Session) -> TranslationResponse:
    """DB에 캐시된 번역이 있으면 반환, 없으면 Claude API 호출 후 저장."""
    word = db.query(Word).filter(Word.korean == korean).first()

    if word:
        examples = db.query(Example).filter(Example.word_id == word.id).all()
        return TranslationResponse(
            korean=word.korean,
            english=word.english,
            english_pronunciation=word.english_pronunciation,
            chinese=word.chinese,
            chinese_pronunciation=word.chinese_pronunciation,
            japanese=word.japanese,
            japanese_pronunciation=word.japanese_pronunciation,
            examples=[
                {"language": ex.language, "sentence": ex.sentence, "korean_translation": ex.korean_translation}
                for ex in examples
            ],
        )

    result = claude_service.translate(korean)

    word = Word(
        korean=result.korean,
        english=result.english,
        english_pronunciation=result.english_pronunciation,
        chinese=result.chinese,
        chinese_pronunciation=result.chinese_pronunciation,
        japanese=result.japanese,
        japanese_pronunciation=result.japanese_pronunciation,
    )
    db.add(word)
    db.flush()

    for ex in result.examples:
        db.add(Example(
            word_id=word.id,
            language=ex.language,
            sentence=ex.sentence,
            korean_translation=ex.korean_translation,
        ))

    db.commit()
    return result
