'use client';

import Link from 'next/link';
import { TranslationResult } from '@/types';
import { saveWord } from '@/lib/storage';

interface Props {
  result: TranslationResult;
}

const LANG_LABELS: Record<string, string> = {
  english: '영어',
  chinese: '중국어',
  japanese: '일본어',
};

const LANG_FLAGS: Record<string, string> = {
  english: '🇺🇸',
  chinese: '🇨🇳',
  japanese: '🇯🇵',
};

export default function TranslationCard({ result }: Props) {
  const langs = [
    { key: 'english', word: result.english, pron: result.english_pronunciation, code: 'en' },
    { key: 'chinese', word: result.chinese, pron: result.chinese_pronunciation, code: 'zh' },
    { key: 'japanese', word: result.japanese, pron: result.japanese_pronunciation, code: 'ja' },
  ];

  function handleSave() {
    saveWord(result);
    alert(`"${result.korean}" 단어장에 저장했습니다.`);
  }

  return (
    <div className="mt-6 space-y-4">
      {/* 원어 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{result.korean}</h2>
        <button
          onClick={handleSave}
          className="text-sm text-indigo-600 border border-indigo-300 rounded-lg px-3 py-1 hover:bg-indigo-50 transition-colors"
        >
          단어장 저장
        </button>
      </div>

      {/* 번역 카드 3개 */}
      <div className="grid gap-3">
        {langs.map(({ key, word, pron, code }) => (
          <div key={key} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-medium">
                {LANG_FLAGS[key]} {LANG_LABELS[key]}
              </span>
              <p className="text-lg font-semibold text-gray-900 mt-0.5">{word}</p>
              <p className="text-sm text-gray-500">{pron}</p>
            </div>
            <Link
              href={`/practice?word=${encodeURIComponent(result.korean)}&lang=${code}`}
              className="text-sm bg-indigo-50 text-indigo-600 rounded-lg px-3 py-1.5 hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              발음 연습 →
            </Link>
          </div>
        ))}
      </div>

      {/* 예문 보기 링크 */}
      <Link
        href={`/examples?word=${encodeURIComponent(result.korean)}`}
        className="block w-full text-center bg-white border border-gray-200 rounded-xl py-3 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
      >
        예문 보기
      </Link>
    </div>
  );
}
