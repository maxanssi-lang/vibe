'use client';

import { PronunciationResult } from '@/types';

interface Props {
  result: PronunciationResult;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';
  return (
    <div className={`text-5xl font-bold ${color}`}>
      {score}
      <span className="text-xl font-normal text-gray-400"> / 100</span>
    </div>
  );
}

export default function ScoreDisplay({ result }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-1">종합 발음 점수</p>
        <ScoreRing score={result.score} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        {[
          { label: '정확도', value: result.accuracy_score },
          { label: '유창성', value: result.fluency_score },
          { label: '완성도', value: result.completeness_score },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-lg py-2">
            <p className="text-gray-500 text-xs">{label}</p>
            <p className="font-semibold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {result.words.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">단어별 점수</p>
          <div className="flex flex-wrap gap-2">
            {result.words.map((w, i) => {
              const color =
                w.error_type === 'None'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : w.score >= 60
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  : 'bg-red-50 text-red-700 border-red-200';
              return (
                <span key={i} className={`px-2 py-1 rounded border text-sm font-medium ${color}`}>
                  {w.word} <span className="text-xs opacity-70">{w.score}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {result.recognized_text && (
        <p className="text-xs text-gray-400">
          인식된 텍스트: <span className="text-gray-600">{result.recognized_text}</span>
        </p>
      )}
    </div>
  );
}
