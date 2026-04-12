'use client';

import { useState, useRef } from 'react';
import { fetchTTS } from '@/lib/api';

export function useTTS() {
  const [loading, setLoading] = useState(false);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function play(text: string, language: string, speed: 'normal' | 'slow' = 'normal') {
    const key = `${language}:${speed}:${text}`;

    // 같은 오디오 재생 중이면 정지
    if (playingKey === key) {
      audioRef.current?.pause();
      setPlayingKey(null);
      return;
    }

    setLoading(true);
    try {
      const blob = await fetchTTS(text, language, speed);
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      setPlayingKey(key);

      audio.play();
      audio.onended = () => setPlayingKey(null);
    } catch {
      alert('TTS 재생에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return { play, loading, playingKey };
}
