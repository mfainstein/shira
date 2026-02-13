import { VoiceConfig, PoetryVoiceSettings } from "./types";

// Curated pool of ElevenLabs multilingual voices suitable for poetry reading.
// All voices support both English and Hebrew via the eleven_multilingual_v2 model.
export const POETRY_VOICES: VoiceConfig[] = [
  {
    id: "pFZP5JQG7iQjIQuC4Bku",   // Lily
    name: "Lily",
    gender: "female",
    description: "Warm, expressive British female voice with gentle delivery",
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",   // Sarah
    name: "Sarah",
    gender: "female",
    description: "Soft, clear female voice with natural warmth",
  },
  {
    id: "FGY2WhTYpPnrIDTdsKH5",   // Laura
    name: "Laura",
    gender: "female",
    description: "Smooth, contemplative female voice ideal for poetry",
  },
  {
    id: "TX3LPaxmHKxFdv7VOQHJ",   // Liam
    name: "Liam",
    gender: "male",
    description: "Deep, resonant male voice with rich emotional range",
  },
  {
    id: "IKne3meq5aSn9XLyUdCD",   // Charlie
    name: "Charlie",
    gender: "male",
    description: "Warm, thoughtful male voice with measured pacing",
  },
  {
    id: "JBFqnCBsd6RMkjVDRZzb",   // George
    name: "George",
    gender: "male",
    description: "Calm, authoritative male voice with expressive delivery",
  },
  {
    id: "XB0fDUnXU5powFXDhCwa",   // Charlotte
    name: "Charlotte",
    gender: "female",
    description: "Elegant, articulate female voice with poetic cadence",
  },
  {
    id: "bIHbv24MWmeRgasZH58o",   // Will
    name: "Will",
    gender: "male",
    description: "Gentle, introspective male voice suited to lyrical content",
  },
];

// Voice settings optimized for poetry reading
export const POETRY_VOICE_SETTINGS: PoetryVoiceSettings = {
  stability: 0.40,          // allows expressive emotional range
  similarity_boost: 0.75,   // balanced clarity
  style: 0.20,              // subtle style enhancement
  speed: 0.90,              // slightly slower for contemplative reading
};

export function getRandomVoice(): VoiceConfig {
  const index = Math.floor(Math.random() * POETRY_VOICES.length);
  return POETRY_VOICES[index];
}
