import { PrismaClient } from "@prisma/client";
import { getLLMAdapter } from "@/lib/llm";
import { safeJsonParse } from "../utils";

interface LineExplanationEntry {
  lineNumber: number;
  explanation: string;
}

const MODELS = ["gemini-3-flash", "claude-opus-4-5"];

function buildPrompt(content: string, language: "EN" | "HE"): string {
  const languageInstruction =
    language === "HE"
      ? "The poem is in Hebrew. Provide explanations in Hebrew."
      : "Provide explanations in English.";

  // Number each non-empty line so the AI can reference by number
  const numberedLines = content
    .split("\n")
    .map((line, i) => (line.trim() ? `${i + 1}: ${line}` : ""))
    .filter(Boolean)
    .join("\n");

  return `For each numbered line of this poem, provide a short (10-15 word) plain-language explanation of what it means in context of the full poem.

${languageInstruction}

Poem (with line numbers):
${numberedLines}

Return a JSON array of objects with "lineNumber" (the number) and "explanation" (the plain-language meaning).

Respond ONLY with the JSON array, no other text:
[{"lineNumber": 1, "explanation": "..."}]`;
}

function extractEntries(content: string): LineExplanationEntry[] | null {
  // Strip markdown code fences
  const stripped = content.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "");

  // Greedy match to get the full array
  const jsonMatch = stripped.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return null;

  const entries = safeJsonParse<LineExplanationEntry[]>(jsonMatch[0]);
  if (!Array.isArray(entries) || entries.length === 0) return null;

  const valid = entries.filter(
    (e) => e && typeof e.lineNumber === "number" && typeof e.explanation === "string"
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
  const contentLines = params.content.split("\n");
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
        // Map line numbers back to exact content lines
        const explanationMap: Record<string, string> = {};
        for (const entry of entries) {
          const lineIdx = entry.lineNumber - 1; // 1-based to 0-based
          const actualLine = contentLines[lineIdx]?.trim();
          if (actualLine) {
            explanationMap[actualLine] = entry.explanation;
          }
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
