import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Word(Base):
    __tablename__ = "words"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    korean: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    english: Mapped[str] = mapped_column(String(200), nullable=False)
    english_pronunciation: Mapped[str] = mapped_column(String(200), nullable=False)
    chinese: Mapped[str] = mapped_column(String(200), nullable=False)
    chinese_pronunciation: Mapped[str] = mapped_column(String(200), nullable=False)
    japanese: Mapped[str] = mapped_column(String(200), nullable=False)
    japanese_pronunciation: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    examples: Mapped[list["Example"]] = relationship("Example", back_populates="word", cascade="all, delete-orphan")


class Example(Base):
    __tablename__ = "examples"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    word_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("words.id", ondelete="CASCADE"), nullable=False)
    language: Mapped[str] = mapped_column(Enum("en", "zh", "ja", name="language_enum"), nullable=False)
    sentence: Mapped[str] = mapped_column(Text, nullable=False)
    korean_translation: Mapped[str] = mapped_column(Text, nullable=False)

    word: Mapped["Word"] = relationship("Word", back_populates="examples")
