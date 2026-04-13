'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { translate } from '@/lib/api';
import { useTTS } from '@/hooks/useTTS';
import TTSButton from '../components/TTSButton';
import { ExampleItem, TranslationResult } from '@/types';

const LANG_LABELS: Record<string, string> = { en: '영어', zh: '중국어', ja: '일본어' };
const LANG_FLAGS: Record<string, string> = { en: '🇺🇸', zh: '🇨🇳', ja: '🇯🇵' };

interface Props {
  searchParams: Promise<{ word?: string }>;
}

export default function ExamplesPage({ searchParams }: Props) {
  const { word } = use(searchParams);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { play, loading: ttsLoading, playingKey } = useTTS();

  useEffect(() => {
    if (!word) return;
    translate(word)
      .then(setResult)
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [word]);

  if (!word) {
    return <p className="text-gray-500">단어가 지정되지 않았습니다.</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-xl font-bold text-gray-900">{word} — 예문</h1>
      </div>

      {loading && <p className="text-gray-400">불러오는 중…</p>}
      {error && <p className="text-red-500">{error}</p>}

      {result && (
        <div className="space-y-4">
          {result.examples.map((ex: ExampleItem) => (
            <ExampleCard
              key={ex.language}
              example={ex}
              play={play}
              ttsLoading={ttsLoading}
              playingKey={playingKey}
              korean={word}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExampleCard({
  example,
  play,
  ttsLoading,
  playingKey,
  korean,
}: {
  example: ExampleItem;
  play: (text: string, language: string, speed: 'normal' | 'slow') => void;
  ttsLoading: boolean;
  playingKey: string | null;
  korean: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          {LANG_FLAGS[example.language]} {LANG_LABELS[example.language]}
        </span>
        <Link
          href={`/practice?word=${encodeURIComponent(korean)}&lang=${example.language}`}
          className="text-sm text-indigo-600 hover:underline"
        >
          발음 연습 →
        </Link>
      </div>

      <p className="text-base font-medium text-gray-900 leading-relaxed">
        {example.sentence}
      </p>
      {example.romanization && (
        <p className="text-sm text-indigo-500 font-medium">{example.romanization}</p>
      )}
      <p className="text-sm text-gray-500">{example.korean_translation}</p>

      <div className="flex gap-2 pt-1">
        <TTSButton
          text={example.sentence}
          language={example.language}
          speed="normal"
          playingKey={playingKey}
          loading={ttsLoading}
          onPlay={play}
          label="재생"
        />
        <TTSButton
          text={example.sentence}
          language={example.language}
          speed="slow"
          playingKey={playingKey}
          loading={ttsLoading}
          onPlay={play}
          label="느리게"
        />
      </div>
    </div>
  );
}
