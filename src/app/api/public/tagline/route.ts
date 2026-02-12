import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FALLBACKS = [
  "Three minds walk into a poem—\neach sees a different door.",
  "We read the verse,\nthe verse reads us right back.",
  "Between the lines\nlives everything unsaid.",
  "A poem is a mirror\nthat shows you someone else's face.",
  "Words, arranged just so,\nbecome a window to the soul.",
];

export async function GET() {
  try {
    // Lazy import to avoid build-time credential checks
    const { getLLMAdapter } = await import("@/lib/llm");
    const llm = getLLMAdapter("gemini-3-flash");

    const response = await llm.generate(
      `Write a single short witty poem (2-4 lines max) about poetry, reading, language, words, or AI analyzing poems. It should be clever, slightly funny, and elegant. No title, no quotes, just the poem itself. Surprise me.`,
      { temperature: 1.5, maxTokens: 100 }
    );

    const poem = response.content.trim().replace(/^["']|["']$/g, "");

    return NextResponse.json({ poem });
  } catch {
    const poem = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
    return NextResponse.json({ poem });
  }
}
