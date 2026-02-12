import { PrismaClient } from "@prisma/client";
import { getLLMAdapter } from "@/lib/llm";
import { researchWithFallback } from "@/lib/research";
import {
  findPoemForThemes,
  poetryDBToContent,
  guessThemes,
} from "../poetrydb";

interface AcquireResult {
  poemId: string;
  title: string;
  content: string;
  language: "EN" | "HE";
  themes: string[];
  cost: number;
}

export async function acquirePoem(
  db: PrismaClient,
  params: {
    acquisitionMode: "found" | "ai_generated";
    topic?: string;
    language: "EN" | "HE";
    sourceModel?: string;
    poemId?: string;
  }
): Promise<AcquireResult> {
  // If a poemId is provided, use existing poem
  if (params.poemId) {
    const existing = await db.poem.findUnique({
      where: { id: params.poemId },
    });
    if (existing) {
      return {
        poemId: existing.id,
        title: existing.language === "HE" ? (existing.titleHe || existing.title) : existing.title,
        content: existing.language === "HE" ? (existing.contentHe || existing.content) : existing.content,
        language: existing.language as "EN" | "HE",
        themes: existing.themes as string[],
        cost: 0,
      };
    }
  }

  if (params.acquisitionMode === "found") {
    return acquireFoundPoem(db, params);
  } else {
    return acquireAIPoem(db, params);
  }
}

async function acquireFoundPoem(
  db: PrismaClient,
  params: { topic?: string; language: "EN" | "HE" }
): Promise<AcquireResult> {
  const themes = params.topic
    ? params.topic.split(",").map((t) => t.trim())
    : ["beauty", "nature"];

  if (params.language === "EN") {
    // Try PoetryDB first
    const poetryDBPoem = await findPoemForThemes(themes);
    if (poetryDBPoem) {
      const content = poetryDBToContent(poetryDBPoem);
      const poemThemes = guessThemes(poetryDBPoem);

      const poem = await db.poem.create({
        data: {
          title: poetryDBPoem.title,
          author: poetryDBPoem.author,
          content,
          language: "EN",
          source: "FOUND",
          themes: poemThemes,
          isPublicDomain: true,
        },
      });

      return {
        poemId: poem.id,
        title: poem.title,
        content: poem.content,
        language: "EN",
        themes: poemThemes,
        cost: 0,
      };
    }
  }

  // Fallback: use research to find a poem
  const searchQuery =
    params.language === "HE"
      ? `famous Hebrew poem about ${themes.join(" or ")}`
      : `classic English poem about ${themes.join(" or ")} full text`;

  const research = await researchWithFallback({
    query: searchQuery,
    context: "Finding a poem for literary analysis",
    maxResults: 5,
  });

  // Use LLM to extract poem from research
  const llm = getLLMAdapter("claude-opus-4-5");
  const extractionResponse = await llm.generate(
    `Based on this research about poems, extract or identify one complete poem. If the full text is available, include it. If not, provide the poem's title, author, and whatever text is available.

Research results: ${research.answer || "No direct answer"}
Sources: ${research.sources.map((s) => s.snippet).join("\n")}

Respond in JSON format:
{"title": "...", "author": "...", "content": "full poem text...", "themes": ["theme1", "theme2"]}`,
    { temperature: 0.3 }
  );

  try {
    const jsonMatch = extractionResponse.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);

      const poem = await db.poem.create({
        data: {
          title: extracted.title,
          author: extracted.author || "Unknown",
          content: extracted.content,
          language: params.language,
          source: "FOUND",
          themes: extracted.themes || themes,
          isPublicDomain: true,
        },
      });

      return {
        poemId: poem.id,
        title: poem.title,
        content: poem.content,
        language: params.language,
        themes: extracted.themes || themes,
        cost: extractionResponse.cost + (research.cost || 0),
      };
    }
  } catch {
    // Fall through to AI generation
  }

  // Last resort: generate with AI
  return acquireAIPoem(db, params);
}

async function acquireAIPoem(
  db: PrismaClient,
  params: {
    topic?: string;
    language: "EN" | "HE";
    sourceModel?: string;
  }
): Promise<AcquireResult> {
  const modelId = params.sourceModel || "claude-opus-4-5";
  const llm = getLLMAdapter(modelId);
  const themes = params.topic
    ? params.topic.split(",").map((t) => t.trim())
    : ["beauty", "nature"];

  const languageInstruction =
    params.language === "HE"
      ? "Write the poem entirely in Hebrew. Include rich Hebrew poetic devices."
      : "Write the poem in English.";

  const response = await llm.generate(
    `Write an original poem about the following themes: ${themes.join(", ")}.

${languageInstruction}

The poem should be between 12-40 lines, with clear stanza breaks. It should be literary, evocative, and suitable for serious literary analysis.

Respond in JSON format:
{"title": "...", "titleHe": "..." (if Hebrew), "content": "full poem with \\n for line breaks", "themes": ["theme1", "theme2", "theme3"]}`,
    { temperature: 0.9, maxTokens: 2000 }
  );

  const jsonMatch = response.content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to generate poem - invalid response format");
  }

  const generated = JSON.parse(jsonMatch[0]);
  const modelEnum =
    modelId.includes("claude") ? "CLAUDE" : modelId.includes("gpt") ? "GPT" : "GEMINI";

  const poem = await db.poem.create({
    data: {
      title: generated.title,
      titleHe: generated.titleHe,
      author: `AI (${modelEnum})`,
      content: generated.content,
      language: params.language,
      source: "AI_GENERATED",
      sourceModel: modelEnum,
      themes: generated.themes || themes,
      isPublicDomain: true,
    },
  });

  return {
    poemId: poem.id,
    title: poem.title,
    content: poem.content,
    language: params.language,
    themes: generated.themes || themes,
    cost: response.cost,
  };
}
