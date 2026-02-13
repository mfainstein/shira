import { AudioGenerationResult } from "./types";
import { getRandomVoice, POETRY_VOICE_SETTINGS } from "./voices";
import { generateVoiceover, generateBackgroundMusic } from "./elevenlabs";
import { mixAudio } from "./mixer";

function buildMusicPrompt(themes: string[]): string {
  const themeStr = themes.slice(0, 4).join(", ");
  return `Gentle, contemplative instrumental piano piece with subtle strings, evoking themes of ${themeStr}. Soft and meditative, suitable as quiet background for spoken word poetry reading. No vocals, no drums.`;
}

// Rough estimate: ~150 words/min at 0.9x speed ≈ 135 words/min
function estimateDurationSeconds(text: string): number {
  const words = text.split(/\s+/).length;
  const minutes = words / 135;
  // Add a few seconds of padding for pauses
  return Math.ceil(minutes * 60) + 5;
}

export async function generatePoemAudio(
  title: string,
  content: string,
  themes: string[],
  language: "EN" | "HE"
): Promise<AudioGenerationResult> {
  const voice = getRandomVoice();
  const musicPrompt = buildMusicPrompt(themes);
  const estimatedDuration = estimateDurationSeconds(content);

  // Prepend title for the voiceover reading
  const voiceoverText = `${title}.\n\n${content}`;

  // Run TTS and music generation in parallel
  const [voiceData, musicData] = await Promise.all([
    generateVoiceover(voiceoverText, voice.id, POETRY_VOICE_SETTINGS, language),
    generateBackgroundMusic(musicPrompt, estimatedDuration),
  ]);

  // Mix voice + music
  const combinedData = await mixAudio(voiceData, musicData);

  return {
    voiceData,
    musicData,
    combinedData,
    voiceId: voice.id,
    voiceName: voice.name,
    musicPrompt,
    durationMs: estimatedDuration * 1000,
  };
}
