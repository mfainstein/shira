import { PrismaClient } from "@prisma/client";
import { getLLMAdapter } from "@/lib/llm";
import { researchWithFallback } from "@/lib/research";
import {
  findPoemForThemes,
  poetryDBToContent,
  guessThemes,
} from "../poetrydb";
import { extractJsonObject } from "../utils";

function normalizeForDedup(s: string): string {
  return s
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9\u0590-\u05ff ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function contentFingerprint(content: string): string {
  // First 60 words, normalized — catches same poem under different titles
  return normalizeForDedup(
    content.split(/\s+/).slice(0, 60).join(" ")
  );
}

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

  // Gather titles + content fingerprints to avoid duplicates
  const existingPoems = await db.poem.findMany({
    select: { title: true, author: true, content: true },
    take: 200,
  });
  const existingTitles = new Set(
    existingPoems.map((p) => `${normalizeForDedup(p.title)}::${normalizeForDedup(p.author)}`)
  );
  const existingContent = new Set(
    existingPoems.map((p) => contentFingerprint(p.content))
  );

  if (params.language === "EN") {
    // Try PoetryDB first
    const poetryDBPoem = await findPoemForThemes(themes, (p) => {
      const key = `${normalizeForDedup(p.title)}::${normalizeForDedup(p.author)}`;
      return !existingTitles.has(key);
    });
    if (poetryDBPoem) {
      const dupeKey = `${normalizeForDedup(poetryDBPoem.title)}::${normalizeForDedup(poetryDBPoem.author)}`;
      const content = poetryDBToContent(poetryDBPoem);
      const contentFp = contentFingerprint(content);
      if (!existingTitles.has(dupeKey) && !existingContent.has(contentFp)) {
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
      // Poem already exists — fall through to research
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

  const hebrewExtraction = params.language === "HE"
    ? `The poem should be in Hebrew. You MUST provide:
- "titleHe": the Hebrew title
- "authorHe": the author name in Hebrew (if known)
- "contentHe": the full poem text in Hebrew
- "title": English translation of the title
- "author": author name in English
- "content": English translation of the poem (translate it yourself if needed)`
    : `Provide "title", "author", and "content" (the full poem text in English).`;

  // Build exclusion list to avoid duplicate poems
  const existingTitlesList = existingPoems
    .slice(0, 30)
    .map((p) => `"${p.title}" by ${p.author}`)
    .join(", ");
  const exclusionNote = existingTitlesList
    ? `\n\nIMPORTANT: We already have these poems, so choose a DIFFERENT one: ${existingTitlesList}`
    : "";

  const extractionResponse = await llm.generate(
    `Based on this research about poems, extract or identify one complete poem. If the full text is available, include it. If not, provide the poem's title, author, and whatever text is available.

${hebrewExtraction}${exclusionNote}

Research results: ${research.answer || "No direct answer"}
Sources: ${research.sources.map((s) => s.snippet).join("\n")}

Respond in JSON format:
{"title": "...", "titleHe": "...", "author": "...", "authorHe": "...", "content": "English text...", "contentHe": "Hebrew text...", "themes": ["theme1", "theme2"]}`,
    { temperature: 0.3 }
  );

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extracted = extractJsonObject<any>(extractionResponse.content);
    if (extracted) {

      // Check for duplicate (title+author or content fingerprint)
      const dupeKey = `${normalizeForDedup(extracted.title || "")}::${normalizeForDedup(extracted.author || "")}`;
      const extractedContent = extracted.content || "";
      const contentFp = contentFingerprint(extractedContent);
      if (existingTitles.has(dupeKey) || existingContent.has(contentFp)) {
        console.log(`[Acquire] Skipping duplicate found poem: ${extracted.title} by ${extracted.author}`);
        // Fall through to AI generation
      } else {
        const poem = await db.poem.create({
          data: {
            title: extracted.title,
            titleHe: extracted.titleHe || null,
            author: extracted.author || "Unknown",
            authorHe: extracted.authorHe || null,
            content: extracted.content,
            contentHe: extracted.contentHe || null,
            language: params.language,
            source: "FOUND",
            themes: extracted.themes || themes,
            isPublicDomain: true,
          },
        });

        return {
          poemId: poem.id,
          title: params.language === "HE" ? (poem.titleHe || poem.title) : poem.title,
          content: params.language === "HE" ? (poem.contentHe || poem.content) : poem.content,
          language: params.language,
          themes: extracted.themes || themes,
          cost: extractionResponse.cost + (research.cost || 0),
        };
      }
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

  // Get existing titles to encourage uniqueness
  const existingPoems = await db.poem.findMany({
    where: { source: "AI_GENERATED" },
    select: { title: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const existingNote = existingPoems.length > 0
    ? `\n\nIMPORTANT: Create something ORIGINAL and DIFFERENT from these existing poems in our collection: ${existingPoems.map((p) => `"${p.title}"`).join(", ")}`
    : "";

  const languageInstruction =
    params.language === "HE"
      ? `Write the poem entirely in Hebrew. Include rich Hebrew poetic devices.

You MUST provide ALL of these fields:
- "titleHe": the Hebrew title
- "title": English translation of the title
- "contentHe": the full poem in Hebrew with \\n for line breaks
- "content": an English translation of the poem
- "authorHe": "AI" in Hebrew (e.g. "בינה מלאכותית")`
      : `Write the poem in English.
Provide "title" and "content" (full poem with \\n for line breaks).`;

  const response = await llm.generate(
    `Write an original poem about the following themes: ${themes.join(", ")}.

${languageInstruction}

The poem should be between 12-40 lines, with clear stanza breaks. It should be literary, evocative, and suitable for serious literary analysis.${existingNote}

Respond in JSON format:
{"title": "...", "titleHe": "...", "content": "...", "contentHe": "...", "themes": ["theme1", "theme2", "theme3"]}`,
    { temperature: 0.9, maxTokens: 3000 }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generated = extractJsonObject<any>(response.content);
  if (!generated) {
    throw new Error("Failed to generate poem - invalid response format");
  }
  const modelEnum =
    modelId.includes("claude") ? "CLAUDE" : modelId.includes("gpt") ? "GPT" : "GEMINI";

  const poem = await db.poem.create({
    data: {
      title: generated.title,
      titleHe: generated.titleHe || null,
      author: `AI (${modelEnum})`,
      authorHe: `בינה מלאכותית (${modelEnum})`,
      content: generated.content,
      contentHe: generated.contentHe || null,
      language: params.language,
      source: "AI_GENERATED",
      sourceModel: modelEnum,
      themes: generated.themes || themes,
      isPublicDomain: true,
    },
  });

  return {
    poemId: poem.id,
    title: params.language === "HE" ? (poem.titleHe || poem.title) : poem.title,
    content: params.language === "HE" ? (poem.contentHe || poem.content) : poem.content,
    language: params.language,
    themes: generated.themes || themes,
    cost: response.cost,
  };
}
