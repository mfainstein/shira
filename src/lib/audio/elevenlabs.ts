import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { ELEVENLABS_CONFIG } from "@/config/pipeline";
import { PoetryVoiceSettings } from "./types";

function getClient(): ElevenLabsClient {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }
  return new ElevenLabsClient({ apiKey });
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function generateVoiceover(
  text: string,
  voiceId: string,
  settings: PoetryVoiceSettings,
  language: "EN" | "HE"
): Promise<Buffer> {
  const client = getClient();

  const languageCode = language === "HE" ? "heb" : "en";
  const modelId = language === "HE" ? "eleven_v3" : ELEVENLABS_CONFIG.ttsModel;

  const stream = await client.textToSpeech.convert(voiceId, {
    text,
    modelId,
    languageCode,
    voiceSettings: {
      stability: settings.stability,
      similarityBoost: settings.similarity_boost,
      style: settings.style,
    },
  });

  return streamToBuffer(stream);
}

export async function generateBackgroundMusic(
  prompt: string,
  durationSeconds: number
): Promise<Buffer> {
  const client = getClient();

  const stream = await client.textToSoundEffects.convert({
    text: prompt,
    durationSeconds,
  });

  return streamToBuffer(stream);
}
