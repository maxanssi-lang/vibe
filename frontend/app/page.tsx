'use client';

import { useState } from 'react';
import SearchBar from './components/SearchBar';
import TranslationCard from './components/TranslationCard';
import { translate } from '@/lib/api';
import { TranslationResult } from '@/types';
import { getSavedWords } from '@/lib/storage';

export default function HomePage() {
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(korean: string) {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await translate(korean);
      setResult(data);
    } catch {
      setError('번역에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }

  const saved = getSavedWords().slice(0, 5);

  return (
    <div>
      <p className="text-gray-500 text-sm mb-4">
        한국어 단어를 입력하면 영어·중국어·일본어로 번역하고 발음을 학습할 수 있어요.
      </p>

      <SearchBar onSearch={handleSearch} loading={loading} />

      {error && (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      )}

      {loading && (
        <div className="mt-8 text-center text-gray-400">번역 중…</div>
      )}

      {result && <TranslationCard result={result} />}

      {!result && !loading && saved.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-500 mb-3">최근 저장한 단어</h3>
          <div className="flex flex-wrap gap-2">
            {saved.map((w) => (
              <button
                key={w.korean}
                onClick={() => handleSearch(w.korean)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                {w.korean}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
