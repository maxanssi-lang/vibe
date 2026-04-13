from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.word import Example, Word
from app.schemas.word import TranslationResponse
from app.services import claude_service


def get_or_create_translation(korean: str, db: Session) -> TranslationResponse:
    """DB에 캐시된 번역이 있으면 예문만 새로 생성, 없으면 번역 후 저장."""
    word = db.query(Word).filter(Word.korean == korean).first()

    if word:
        db.query(Example).filter(Example.word_id == word.id).delete()
        new_examples = claude_service.generate_examples(
            word.korean, word.english, word.chinese, word.japanese
        )
        for ex in new_examples:
            db.add(Example(
                word_id=word.id,
                language=ex.language,
                sentence=ex.sentence,
                romanization=ex.romanization,
                korean_translation=ex.korean_translation,
            ))
        db.commit()
        return TranslationResponse(
            korean=word.korean,
            english=word.english,
            english_pronunciation=word.english_pronunciation,
            chinese=word.chinese,
            chinese_pronunciation=word.chinese_pronunciation,
            japanese=word.japanese,
            japanese_pronunciation=word.japanese_pronunciation,
            examples=new_examples,
        )

    result = claude_service.translate(korean)

    try:
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
                romanization=ex.romanization,
                korean_translation=ex.korean_translation,
            ))
        db.commit()
    except IntegrityError:
        db.rollback()
        # 동시 요청으로 이미 저장된 경우 DB에서 다시 조회
        word = db.query(Word).filter(Word.korean == korean).first()
        if word:
            examples = db.query(Example).filter(Example.word_id == word.id).all()
            result.examples = [
                type(result.examples[0])(
                    language=ex.language,
                    sentence=ex.sentence,
                    romanization=ex.romanization,
                    korean_translation=ex.korean_translation,
                )
                for ex in examples
            ]

    return result
