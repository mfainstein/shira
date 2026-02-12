import OpenAI from "openai";
import sharp from "sharp";
import { ArtGenerationResult } from "./types";

export async function createDalleArt(
  title: string,
  content: string,
  themes: string[]
): Promise<ArtGenerationResult> {
  const imagePrompt = `Create an atmospheric, editorial illustration for a poem titled "${title}". Themes: ${themes.join(", ")}. Style: e-ink aesthetic, minimalist, no text, black and white with subtle warm tones, evocative and contemplative. The illustration should capture the emotional essence of the poem. No words or letters in the image.`;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural",
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No image data returned from DALL-E");
    }

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error("No image URL returned from DALL-E");
    }

    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const downloadedBuffer = Buffer.from(arrayBuffer);

    // Resize to 1200x800 for consistent display
    const imageBuffer = await sharp(downloadedBuffer)
      .resize(1200, 800, { fit: "cover", position: "center" })
      .png()
      .toBuffer();

    return {
      imageData: imageBuffer,
      prompt: imagePrompt,
      style: "DALLE",
    };
  } catch (error) {
    console.error("DALL-E art generation failed:", error);
    // Fall back to minimalist
    const { createMinimalistArt } = await import("./minimalist");
    return createMinimalistArt(title, content, themes);
  }
}
