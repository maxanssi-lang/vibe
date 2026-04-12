import axios from "axios";
import { PronunciationResult, TranslationResult } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
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

export async function evaluatePronunciation(
  audioBlob: Blob,
  referenceText: string,
  language: string
): Promise<PronunciationResult> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.wav");
  formData.append("reference_text", referenceText);
  formData.append("language", language);

  const { data } = await api.post<PronunciationResult>("/pronunciation/evaluate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
