import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FALLBACKS = [
  "Three minds walk into a poem—\neach sees a different door.\nOne finds a garden, one a war,\nthe third just asks for more.",
  "We fed the verse to three machines\nand asked them what they saw.\nOne wept, one laughed, one cited Keats—\nnone mentioned a flaw.",
  "A poem sits on the page and waits\nlike a cat on a windowsill,\nknowing you'll come eventually,\nknowing you always will.",
  "Between the lines lives everything\nthe poet was afraid to say.\nThe words are just the furniture—\nthe silence is the play.",
  "The algorithm reads the sonnet twice,\nthen clears its throat to speak.\nIt has opinions on the meter\nand feelings about technique.",
];

export async function GET() {
  try {
    // Lazy import to avoid build-time credential checks
    const { getLLMAdapter } = await import("@/lib/llm");
    const llm = getLLMAdapter("gemini-3-flash");

    const response = await llm.generate(
      `Write a short original poem — exactly 4 to 6 lines — about one of these topics: the nature of poetry, the act of reading, the power of words, language itself, or the absurdity of machines analyzing verse.

It must feel like a real poem: with line breaks, rhythm, imagery. Be witty, a little irreverent, but elegant. Think Emily Dickinson meets stand-up comedy.

Rules:
- Exactly 4-6 lines, each line on its own line
- No title
- No quotation marks around the poem
- Just the poem, nothing else`,
      { temperature: 1.5, maxTokens: 200 }
    );

    const poem = response.content.trim().replace(/^["']|["']$/g, "");

    return NextResponse.json({ poem });
  } catch {
    const poem = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
    return NextResponse.json({ poem });
  }
}
