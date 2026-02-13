import { PrismaClient } from "@prisma/client";
import { getLLMAdapter } from "@/lib/llm";
import { safeJsonParse } from "../utils";
import { normalizeWord } from "@/lib/vocabulary-utils";

interface VocabularyEntry {
  word: string;
  definition: string;
}

const VOCAB_MODELS = ["gemini-3-flash", "claude-opus-4-5"];

function buildVocabPrompt(content: string, language: "EN" | "HE"): string {
  const languageInstruction =
    language === "HE"
      ? "The poem is in Hebrew. Identify non-basic Hebrew words that an intermediate Hebrew reader might not know. Provide definitions in English. Return words WITHOUT niqqud (vowel points) and WITHOUT surrounding punctuation — just the bare Hebrew word."
      : "Identify non-basic English words that a typical reader might not know. Provide concise definitions. Return words WITHOUT surrounding punctuation — just the bare word.";

  return `Analyze this poem and identify words that are not basic everyday vocabulary — literary, archaic, technical, or uncommon words that a reader might want to look up.

${languageInstruction}

Poem:
${content}

Return a JSON array of objects with "word" (the exact word as it appears in the poem) and "definition" (a brief, clear definition in English, 5-15 words).

Only include genuinely non-basic words (aim for 5-15 words). Do NOT include common words.

Respond ONLY with the JSON array, no other text:
[{"word": "...", "definition": "..."}]`;
}

function extractVocabEntries(content: string): VocabularyEntry[] | null {
  // Try matching a JSON array — use non-greedy to avoid grabbing too much
  const jsonMatch = content.match(/\[[\s\S]*?\]/);
  if (!jsonMatch) return null;

  const entries = safeJsonParse<VocabularyEntry[]>(jsonMatch[0]);
  if (!Array.isArray(entries) || entries.length === 0) return null;

  // Validate entries have the right shape
  const valid = entries.filter(
    (e) => e && typeof e.word === "string" && typeof e.definition === "string"
  );
  return valid.length > 0 ? valid : null;
}

export async function generateVocabulary(
  db: PrismaClient,
  params: {
    poemId: string;
    content: string;
    language: "EN" | "HE";
  }
): Promise<{ entries: number; cost: number }> {
  const prompt = buildVocabPrompt(params.content, params.language);
  let totalCost = 0;

  // Try each model in order until one succeeds
  for (const modelId of VOCAB_MODELS) {
    try {
      const llm = getLLMAdapter(modelId);
      const response = await llm.generate(prompt, {
        temperature: 0.3,
        maxTokens: 1500,
      });
      totalCost += response.cost;

      const entries = extractVocabEntries(response.content);
      if (entries) {
        const vocabMap: Record<string, string> = {};
        for (const entry of entries) {
          const key = normalizeWord(entry.word);
          if (key) vocabMap[key] = entry.definition;
        }

        if (Object.keys(vocabMap).length > 0) {
          await db.poem.update({
            where: { id: params.poemId },
            data: { vocabulary: vocabMap },
          });
          console.log(
            `[Vocabulary] Generated ${Object.keys(vocabMap).length} entries using ${modelId}`
          );
          return { entries: Object.keys(vocabMap).length, cost: totalCost };
        }
      }

      console.warn(`[Vocabulary] ${modelId} returned no valid entries, trying next model`);
    } catch (error) {
      console.warn(`[Vocabulary] ${modelId} failed:`, error instanceof Error ? error.message : error);
    }
  }

  console.error("[Vocabulary] All models failed to generate vocabulary");
  return { entries: 0, cost: totalCost };
}
