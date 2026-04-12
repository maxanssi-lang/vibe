'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSavedWords, deleteWord, getTodayReviewWords } from '@/lib/storage';
import { SavedWord } from '@/types';

const LANG_FLAGS: Record<string, string> = { en: '🇺🇸', zh: '🇨🇳', ja: '🇯🇵' };

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-gray-400">미평가</span>;
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-500';
  return <span className={`text-xs font-semibold ${color}`}>최고 {score}점</span>;
}

export default function WordbookPage() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [reviewWords, setReviewWords] = useState<SavedWord[]>([]);
  const [tab, setTab] = useState<'all' | 'review'>('all');

  useEffect(() => {
    setWords(getSavedWords());
    setReviewWords(getTodayReviewWords());
  }, []);

  function handleDelete(korean: string) {
    deleteWord(korean);
    setWords(getSavedWords());
    setReviewWords(getTodayReviewWords());
  }

  const displayed = tab === 'review' ? reviewWords : words;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">단어장</h1>

      {/* 탭 */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        <button
          onClick={() => setTab('all')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
            ${tab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          전체 ({words.length})
        </button>
        <button
          onClick={() => setTab('review')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
            ${tab === 'review' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          오늘 복습 {reviewWords.length > 0 && (
            <span className="ml-1 bg-indigo-600 text-white text-xs rounded-full px-1.5">{reviewWords.length}</span>
          )}
        </button>
      </div>

      {/* 단어 목록 */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {tab === 'review' ? '오늘 복습할 단어가 없어요.' : '저장된 단어가 없어요.'}
          {tab === 'all' && (
            <div className="mt-2">
              <Link href="/" className="text-indigo-600 text-sm hover:underline">단어 검색하러 가기 →</Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((word) => (
            <WordCard key={word.korean} word={word} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function WordCard({ word, onDelete }: { word: SavedWord; onDelete: (k: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div>
          <span className="font-semibold text-gray-900">{word.korean}</span>
          <span className="ml-2 text-sm text-gray-500">{word.english}</span>
        </div>
        <div className="flex items-center gap-3">
          <ScoreBadge score={word.bestScore} />
          <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3">
          {/* 번역 요약 */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            {[
              { flag: '🇺🇸', label: '영어', value: word.english },
              { flag: '🇨🇳', label: '중국어', value: word.chinese },
              { flag: '🇯🇵', label: '일본어', value: word.japanese },
            ].map(({ flag, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-400">{flag} {label}</p>
                <p className="font-medium text-gray-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* 학습 정보 */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>학습 횟수: {word.reviewCount}회</span>
            {word.nextReviewAt && (
              <span>다음 복습: {new Date(word.nextReviewAt).toLocaleDateString('ko-KR')}</span>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            {['en', 'zh', 'ja'].map((lang) => (
              <Link
                key={lang}
                href={`/practice?word=${encodeURIComponent(word.korean)}&lang=${lang}`}
                className="flex-1 text-center py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors"
              >
                {LANG_FLAGS[lang]} 연습
              </Link>
            ))}
            <button
              onClick={() => onDelete(word.korean)}
              className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs hover:bg-red-100 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
