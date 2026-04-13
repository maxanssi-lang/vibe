'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { translate, evaluatePronunciation } from '@/lib/api';
import { useTTS } from '@/hooks/useTTS';
import { useRecorder } from '@/hooks/useRecorder';
import TTSButton from '../components/TTSButton';
import ScoreDisplay from '../components/ScoreDisplay';
import { updateScore } from '@/lib/storage';
import { ExampleItem, PronunciationResult, TranslationResult } from '@/types';

const LANG_LABELS: Record<string, string> = { en: '영어', zh: '중국어', ja: '일본어' };
const LANG_FLAGS: Record<string, string> = { en: '🇺🇸', zh: '🇨🇳', ja: '🇯🇵' };

interface Props {
  searchParams: Promise<{ word?: string; lang?: string }>;
}

export default function PracticePage({ searchParams }: Props) {
  const { word, lang } = use(searchParams);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [score, setScore] = useState<PronunciationResult | null>(null);
  const [error, setError] = useState('');

  const { play, loading: ttsLoading, playingKey } = useTTS();
  const { state, audioBlob, start, stop, reset } = useRecorder();

  useEffect(() => {
    if (!word) return;
    translate(word)
      .then(setResult)
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [word]);

  const example: ExampleItem | undefined = result?.examples.find((e) => e.language === lang);

  async function handleEvaluate() {
    if (!audioBlob || !example || !lang) return;
    setEvaluating(true);
    setError('');
    try {
      const res = await evaluatePronunciation(audioBlob, example.sentence, lang);
      setScore(res);
      if (word) updateScore(word, res.score);
    } catch {
      setError('발음 평가에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setEvaluating(false);
    }
  }

  function handleRetry() {
    reset();
    setScore(null);
  }

  if (!word || !lang) {
    return <p className="text-gray-500">잘못된 접근입니다.</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/examples?word=${encodeURIComponent(word)}`} className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-xl font-bold text-gray-900">
          {LANG_FLAGS[lang]} {word} — {LANG_LABELS[lang]} 발음 연습
        </h1>
      </div>

      {loading && <p className="text-gray-400">불러오는 중…</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {example && (
        <div className="space-y-4">
          {/* 예문 카드 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <p className="text-base font-medium text-gray-900 leading-relaxed">{example.sentence}</p>
            {example.romanization && (
              <p className="text-sm text-indigo-500 font-medium">{example.romanization}</p>
            )}
            <p className="text-sm text-gray-500">{example.korean_translation}</p>
            <div className="flex gap-2 pt-1">
              <TTSButton
                text={example.sentence}
                language={lang}
                speed="normal"
                playingKey={playingKey}
                loading={ttsLoading}
                onPlay={play}
                label="재생"
              />
              <TTSButton
                text={example.sentence}
                language={lang}
                speed="slow"
                playingKey={playingKey}
                loading={ttsLoading}
                onPlay={play}
                label="느리게"
              />
            </div>
          </div>

          {/* 녹음 컨트롤 */}
          {!score && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center space-y-4">
              <p className="text-sm text-gray-500">위 예문을 따라 말해보세요</p>

              {state === 'idle' && (
                <button
                  onClick={start}
                  className="w-16 h-16 rounded-full bg-indigo-600 text-white text-2xl mx-auto flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  🎤
                </button>
              )}

              {state === 'recording' && (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-red-500 text-white text-2xl mx-auto flex items-center justify-center animate-pulse shadow-lg">
                    ⏺
                  </div>
                  <p className="text-sm text-red-500 font-medium">녹음 중…</p>
                  <button
                    onClick={stop}
                    className="px-5 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900 transition-colors"
                  >
                    녹음 완료
                  </button>
                </div>
              )}

              {state === 'done' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-600 font-medium">녹음 완료</p>
                  {/* 녹음 재생 버튼 */}
                  {audioBlob && (
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          const url = URL.createObjectURL(audioBlob);
                          const audio = new Audio(url);
                          audio.play();
                          audio.onended = () => URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      >
                        🔊 내 녹음 듣기
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleEvaluate}
                      disabled={evaluating}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {evaluating ? '평가 중…' : '발음 평가하기'}
                    </button>
                    <button
                      onClick={handleRetry}
                      className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      다시 녹음
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 평가 결과 */}
          {score && (
            <div className="space-y-3">
              <ScoreDisplay result={score} />
              <button
                onClick={handleRetry}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                다시 도전하기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
