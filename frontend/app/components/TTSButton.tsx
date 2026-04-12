'use client';

interface Props {
  text: string;
  language: string;
  speed?: 'normal' | 'slow';
  playingKey: string | null;
  loading: boolean;
  onPlay: (text: string, language: string, speed: 'normal' | 'slow') => void;
  label?: string;
}

export default function TTSButton({ text, language, speed = 'normal', playingKey, loading, onPlay, label }: Props) {
  const key = `${language}:${speed}:${text}`;
  const isPlaying = playingKey === key;

  return (
    <button
      onClick={() => onPlay(text, language, speed)}
      disabled={loading && !isPlaying}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
        ${isPlaying
          ? 'bg-indigo-100 text-indigo-700'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:opacity-50`}
    >
      {isPlaying ? '⏸' : '▶'} {label ?? (speed === 'slow' ? '느리게' : '재생')}
    </button>
  );
}
