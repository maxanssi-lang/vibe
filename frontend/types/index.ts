export interface ExampleItem {
  language: "en" | "zh" | "ja";
  sentence: string;
  romanization: string | null;
  korean_translation: string;
}

export interface TranslationResult {
  korean: string;
  english: string;
  english_pronunciation: string;
  chinese: string;
  chinese_pronunciation: string;
  japanese: string;
  japanese_pronunciation: string;
  examples: ExampleItem[];
}

export interface PronunciationResult {
  score: number;
  accuracy_score: number;
  fluency_score: number;
  completeness_score: number;
  words: WordResult[];
  recognized_text: string;
}

export interface WordResult {
  word: string;
  score: number;
  error_type: string;
  phonemes: PhonemeResult[];
}

export interface PhonemeResult {
  phoneme: string;
  score: number;
}

export interface SavedWord {
  korean: string;
  english: string;
  chinese: string;
  japanese: string;
  savedAt: string;
  bestScore: number | null;
  reviewCount: number;
  nextReviewAt: string | null;
}
