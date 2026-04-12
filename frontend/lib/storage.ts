import { SavedWord, TranslationResult } from "@/types";

const STORAGE_KEY = "vibe_words";

function getWords(): SavedWord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveWords(words: SavedWord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

export function saveWord(result: TranslationResult): void {
  const words = getWords();
  const exists = words.findIndex((w) => w.korean === result.korean);
  if (exists !== -1) return; // 이미 저장된 단어

  words.unshift({
    korean: result.korean,
    english: result.english,
    chinese: result.chinese,
    japanese: result.japanese,
    savedAt: new Date().toISOString(),
    bestScore: null,
    reviewCount: 0,
    nextReviewAt: null,
  });
  saveWords(words);
}

export function getSavedWords(): SavedWord[] {
  return getWords();
}

export function updateScore(korean: string, score: number): void {
  const words = getWords();
  const word = words.find((w) => w.korean === korean);
  if (!word) return;

  word.reviewCount += 1;
  word.bestScore = word.bestScore === null ? score : Math.max(word.bestScore, score);
  word.nextReviewAt = calcNextReview(word.reviewCount, score);
  saveWords(words);
}

export function getTodayReviewWords(): SavedWord[] {
  const now = new Date().toISOString();
  return getWords().filter((w) => w.nextReviewAt !== null && w.nextReviewAt <= now);
}

export function deleteWord(korean: string): void {
  saveWords(getWords().filter((w) => w.korean !== korean));
}

/** SM-2 간이 구현: 점수에 따라 다음 복습일 계산 */
function calcNextReview(reviewCount: number, score: number): string {
  let intervalDays: number;

  if (score < 60) {
    intervalDays = 1;
  } else if (reviewCount === 1) {
    intervalDays = 1;
  } else if (reviewCount === 2) {
    intervalDays = 3;
  } else {
    intervalDays = Math.round((reviewCount - 1) * 2.5 * (score / 100));
  }

  const next = new Date();
  next.setDate(next.getDate() + intervalDays);
  return next.toISOString();
}
