import ffmpeg from "fluent-ffmpeg";
import { tmpdir } from "os";
import { join } from "path";
import { writeFile, readFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";

export async function mixAudio(
  voiceBuffer: Buffer,
  musicBuffer: Buffer
): Promise<Buffer> {
  const id = randomUUID();
  const tmp = tmpdir();
  const voicePath = join(tmp, `voice-${id}.mp3`);
  const musicPath = join(tmp, `music-${id}.mp3`);
  const outputPath = join(tmp, `combined-${id}.mp3`);

  await Promise.all([
    writeFile(voicePath, voiceBuffer),
    writeFile(musicPath, musicBuffer),
  ]);

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(voicePath)
        .input(musicPath)
        .complexFilter([
          // Lower music volume to ~20% of voice level
          "[1:a]volume=0.20[music]",
          // Mix voice (full volume) with quiet music
          "[0:a][music]amix=inputs=2:duration=first:dropout_transition=3[out]",
        ])
        .outputOptions(["-map", "[out]"])
        .audioCodec("libmp3lame")
        .audioBitrate("192k")
        .output(outputPath)
        .on("error", reject)
        .on("end", () => resolve())
        .run();
    });

    return await readFile(outputPath);
  } finally {
    await Promise.all([
      unlink(voicePath).catch(() => {}),
      unlink(musicPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);
  }
}
