import axios from "axios";
import { PronunciationResult, TranslationResult } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
});

export async function translate(korean: string): Promise<TranslationResult> {
  const { data } = await api.post<TranslationResult>("/words/translate", { korean });
  return data;
}

export async function fetchTTS(
  text: string,
  language: string,
  speed: "normal" | "slow" = "normal"
): Promise<Blob> {
  const { data } = await api.post(
    "/pronunciation/tts",
    { text, language, speed },
    { responseType: "blob" }
  );
  return data;
}

async function convertToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext({ sampleRate: 16000 });
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  await audioCtx.close();

  const samples = audioBuffer.getChannelData(0);
  const wavBuffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(wavBuffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);   // PCM
  view.setUint16(22, 1, true);   // mono
  view.setUint32(24, 16000, true); // sample rate
  view.setUint32(28, 32000, true); // byte rate
  view.setUint16(32, 2, true);   // block align
  view.setUint16(34, 16, true);  // bits per sample
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([wavBuffer], { type: "audio/wav" });
}

export async function evaluatePronunciation(
  audioBlob: Blob,
  referenceText: string,
  language: string
): Promise<PronunciationResult> {
  const wavBlob = await convertToWav(audioBlob);

  const formData = new FormData();
  formData.append("audio", wavBlob, "recording.wav");
  formData.append("reference_text", referenceText);
  formData.append("language", language);

  const { data } = await api.post<PronunciationResult>("/pronunciation/evaluate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
