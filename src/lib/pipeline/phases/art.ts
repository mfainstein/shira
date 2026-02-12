import { PrismaClient } from "@prisma/client";
import { generateArt } from "@/lib/art";

interface ArtResult {
  artId: string;
  style: string;
}

export async function generatePoemArt(
  db: PrismaClient,
  params: {
    poemId: string;
    title: string;
    content: string;
    themes: string[];
    artStyle: "MINIMALIST" | "DALLE";
  }
): Promise<ArtResult> {
  const result = await generateArt(
    params.artStyle,
    params.title,
    params.content,
    params.themes
  );

  const art = await db.poemArt.create({
    data: {
      poemId: params.poemId,
      style: params.artStyle,
      imageData: result.imageData,
      drawCommands: result.drawCommands
        ? JSON.parse(JSON.stringify(result.drawCommands))
        : undefined,
      prompt: result.prompt,
      status: "COMPLETED",
    },
  });

  return {
    artId: art.id,
    style: params.artStyle,
  };
}
