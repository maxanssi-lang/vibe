'use client';

import { useState, useRef } from 'react';

type RecorderState = 'idle' | 'recording' | 'done';

const MIME_TYPE = 'audio/webm;codecs=opus';

export function useRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobEvent['data'][]>([]);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported(MIME_TYPE) ? MIME_TYPE : 'audio/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setAudioBlob(blob);
      setState('done');
      stream.getTracks().forEach((t) => t.stop());
    };

    mediaRef.current = recorder;
    recorder.start();
    setState('recording');
  }

  function stop() {
    mediaRef.current?.stop();
  }

  function reset() {
    setAudioBlob(null);
    setState('idle');
  }

  return { state, audioBlob, start, stop, reset };
}
