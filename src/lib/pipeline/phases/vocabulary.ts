import { PrismaClient } from "@prisma/client";
import { getLLMAdapter } from "@/lib/llm";
import { safeJsonParse } from "../utils";

interface VocabularyEntry {
  word: string;
  definition: string;
}

export async function generateVocabulary(
  db: PrismaClient,
  params: {
    poemId: string;
    content: string;
    language: "EN" | "HE";
  }
): Promise<{ entries: number; cost: number }> {
  const llm = getLLMAdapter("gemini-3-flash");

  const languageInstruction =
    params.language === "HE"
      ? "The poem is in Hebrew. Identify non-basic Hebrew words that an intermediate Hebrew reader might not know. Provide definitions in English."
      : "Identify non-basic English words that a typical reader might not know. Provide concise definitions.";

  const response = await llm.generate(
    `Analyze this poem and identify words that are not basic everyday vocabulary — literary, archaic, technical, or uncommon words that a reader might want to look up.

${languageInstruction}

Poem:
${params.content}

Return a JSON array of objects with "word" (the exact word as it appears in the poem) and "definition" (a brief, clear definition in English, 5-15 words).

Only include genuinely non-basic words (aim for 5-15 words). Do NOT include common words.

Respond ONLY with the JSON array, no other text:
[{"word": "...", "definition": "..."}]`,
    { temperature: 0.3, maxTokens: 1500 }
  );

  try {
    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const entries = safeJsonParse<VocabularyEntry[]>(jsonMatch[0]);

      // Store as a map: word -> definition
      const vocabMap: Record<string, string> = {};
      for (const entry of entries) {
        vocabMap[entry.word.toLowerCase()] = entry.definition;
      }

      await db.poem.update({
        where: { id: params.poemId },
        data: { vocabulary: vocabMap },
      });

      return { entries: entries.length, cost: response.cost };
    }
  } catch (error) {
    console.error("Vocabulary generation failed:", error);
  }

  return { entries: 0, cost: response.cost };
}
