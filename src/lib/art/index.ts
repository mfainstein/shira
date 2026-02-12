import { ArtGenerationResult } from "./types";
import { createMinimalistArt } from "./minimalist";
import { createDalleArt } from "./dalle";

export { createMinimalistArt, createDalleArt };
export * from "./types";

export async function generateArt(
  style: "MINIMALIST" | "DALLE",
  title: string,
  content: string,
  themes: string[]
): Promise<ArtGenerationResult> {
  switch (style) {
    case "DALLE":
      return createDalleArt(title, content, themes);
    case "MINIMALIST":
    default:
      return createMinimalistArt(title, content, themes);
  }
}
