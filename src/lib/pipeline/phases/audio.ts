import { PrismaClient } from "@prisma/client";
import { generatePoemAudio } from "@/lib/audio";

interface AudioResult {
  audioId: string;
  voiceName: string;
}

export async function generatePoemAudioPhase(
  db: PrismaClient,
  params: {
    poemId: string;
    title: string;
    content: string;
    themes: string[];
    language: "EN" | "HE";
  }
): Promise<AudioResult> {
  const result = await generatePoemAudio(
    params.title,
    params.content,
    params.themes,
    params.language
  );

  const audio = await db.poemAudio.create({
    data: {
      poemId: params.poemId,
      voiceData: result.voiceData,
      musicData: result.musicData,
      combinedData: result.combinedData,
      voiceId: result.voiceId,
      voiceName: result.voiceName,
      musicPrompt: result.musicPrompt,
      language: params.language,
      durationMs: result.durationMs,
      status: "COMPLETED",
    },
  });

  return {
    audioId: audio.id,
    voiceName: result.voiceName,
  };
}
