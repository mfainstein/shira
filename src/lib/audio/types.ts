export interface AudioGenerationResult {
  voiceData: Buffer;
  musicData: Buffer;
  combinedData: Buffer;
  voiceId: string;
  voiceName: string;
  musicPrompt: string;
  durationMs: number;
}

export interface VoiceConfig {
  id: string;
  name: string;
  gender: "male" | "female";
  description: string;
}

export interface PoetryVoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
}
