import { PrismaClient } from "@prisma/client";
import { getLLMAdapter } from "@/lib/llm";
import { safeJsonParse } from "../utils";

interface LineExplanationEntry {
  line: string;
  explanation: string;
}

const MODELS = ["gemini-3-flash", "claude-opus-4-5"];

function buildPrompt(content: string, language: "EN" | "HE"): string {
  const languageInstruction =
    language === "HE"
      ? "The poem is in Hebrew. Provide explanations in Hebrew. Each explanation should be a plain-language paraphrase of what the line means."
      : "Provide explanations in English. Each explanation should be a plain-language paraphrase of what the line means.";

  return `For each line of this poem, provide a short (10-15 word) plain-language explanation of what it means in context of the full poem.

${languageInstruction}

Poem:
${content}

Return a JSON array of objects with "line" (the exact line text) and "explanation" (the plain-language meaning).
Skip empty lines. Only include lines that contain text.

Respond ONLY with the JSON array, no other text:
[{"line": "...", "explanation": "..."}]`;
}

function extractEntries(content: string): LineExplanationEntry[] | null {
  const jsonMatch = content.match(/\[[\s\S]*?\]/);
  if (!jsonMatch) return null;

  const entries = safeJsonParse<LineExplanationEntry[]>(jsonMatch[0]);
  if (!Array.isArray(entries) || entries.length === 0) return null;

  const valid = entries.filter(
    (e) => e && typeof e.line === "string" && typeof e.explanation === "string"
  );
  return valid.length > 0 ? valid : null;
}

export async function generateLineExplanations(
  db: PrismaClient,
  params: {
    poemId: string;
    content: string;
    language: "EN" | "HE";
  }
): Promise<{ lines: number; cost: number }> {
  const prompt = buildPrompt(params.content, params.language);
  let totalCost = 0;

  for (const modelId of MODELS) {
    try {
      const llm = getLLMAdapter(modelId);
      const response = await llm.generate(prompt, {
        temperature: 0.3,
        maxTokens: 2000,
      });
      totalCost += response.cost;

      const entries = extractEntries(response.content);
      if (entries) {
        const explanationMap: Record<string, string> = {};
        for (const entry of entries) {
          const key = entry.line.trim();
          if (key) explanationMap[key] = entry.explanation;
        }

        if (Object.keys(explanationMap).length > 0) {
          await db.poem.update({
            where: { id: params.poemId },
            data: { lineExplanations: explanationMap },
          });
          console.log(
            `[LineExplanations] Generated ${Object.keys(explanationMap).length} explanations using ${modelId}`
          );
          return { lines: Object.keys(explanationMap).length, cost: totalCost };
        }
      }

      console.warn(`[LineExplanations] ${modelId} returned no valid entries, trying next model`);
    } catch (error) {
      console.warn(`[LineExplanations] ${modelId} failed:`, error instanceof Error ? error.message : error);
    }
  }

  console.error("[LineExplanations] All models failed to generate line explanations");
  return { lines: 0, cost: totalCost };
}
