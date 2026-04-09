import OpenAI from "openai";
import { getFileBuffer } from "../lib/s3";
import { Readable } from "stream";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudio(s3Key: string): Promise<string> {
  const buffer = await getFileBuffer(s3Key);

  // Whisper requires a file-like object with a name
  const file = new File([buffer], s3Key.split("/").pop() ?? "audio.mp3", {
    type: "audio/mpeg",
  });

  const response = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "text",
    language: "en",
  });

  return response as unknown as string;
}

export function estimateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateDuration(wordCount: number): number {
  // Average speaking pace: ~130 words/minute
  return Math.round((wordCount / 130) * 60);
}
