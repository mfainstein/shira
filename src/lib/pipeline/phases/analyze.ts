import { PrismaClient } from "@prisma/client";
import { getAllAdapters, LLMResponse } from "@/lib/llm";
import { extractJsonObject } from "../utils";

interface AnalyzeResult {
  completed: number;
  failed: number;
  totalCost: number;
}

function buildAnalysisPrompt(
  title: string,
  author: string,
  content: string,
  themes: string[],
  language: "EN" | "HE"
): string {
  const languageInstruction =
    language === "HE"
      ? `IMPORTANT: Respond entirely in Hebrew. All analysis must be written in Hebrew.

In addition to the standard analysis categories, include a dedicated section for Hebrew-specific poetic devices:
- Biblical parallelism (הקבלה)
- Root-play / shoresh wordplay (משחקי שורשים)
- Chiasmus (כיאזמוס)
- Acrostic patterns (אקרוסטיכון)
- Allusions to biblical or liturgical texts (רמזים למקורות)`
      : "Respond in English.";

  return `You are a literary critic and poetry analyst. Analyze the following poem in depth.

Title: ${title}
Author: ${author}
Themes: ${themes.join(", ")}

--- POEM ---
${content}
--- END POEM ---

${languageInstruction}

Provide your analysis in the following JSON format:
{
  "literaryAnalysis": "Analysis of literary devices, structure, form, meter, rhyme scheme, enjambment, imagery, metaphor, simile, personification, etc.",
  "thematicAnalysis": "Analysis of the poem's themes, central ideas, philosophical underpinnings, and how they develop through the poem.",
  "emotionalAnalysis": "Analysis of the emotional arc, tone shifts, mood, and the reader's emotional journey through the poem.",
  "culturalAnalysis": "Analysis of cultural context, historical period, literary movement, intertextual references, and the poem's place in literary tradition."${
    language === "HE"
      ? ',\n  "hebrewAnalysis": "Dedicated analysis of Hebrew-specific poetic devices: biblical parallelism, root-play, chiasmus, acrostic patterns, allusions to sacred texts, and unique features of Hebrew prosody."'
      : ""
  }
}

Respond ONLY with valid JSON.`;
}

export async function analyzePoem(
  db: PrismaClient,
  params: {
    poemId: string;
    title: string;
    author: string;
    content: string;
    themes: string[];
    language: "EN" | "HE";
  }
): Promise<AnalyzeResult> {
  const adapters = getAllAdapters();
  const prompt = buildAnalysisPrompt(
    params.title,
    params.author,
    params.content,
    params.themes,
    params.language
  );

  const results = await Promise.allSettled(
    adapters.map(async ({ model, adapter }) => {
      const startTime = Date.now();

      const response: LLMResponse = await adapter.generate(prompt, {
        temperature: 0.5,
        maxTokens: 4096,
        jsonMode: true,
      });

      let durationMs = Date.now() - startTime;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let analysis = extractJsonObject<any>(response.content);

      // Retry once with a simpler prompt if JSON extraction failed
      if (!analysis) {
        console.warn(`[Analyze] ${model}: first attempt returned invalid JSON, retrying`);
        const retry: LLMResponse = await adapter.generate(
          prompt + "\n\nIMPORTANT: You MUST respond with ONLY a raw JSON object. No markdown, no code fences, no explanation. Just the JSON.",
          { temperature: 0.3, maxTokens: 4096, jsonMode: true }
        );
        response.tokensUsed.total += retry.tokensUsed.total;
        response.cost += retry.cost;
        durationMs = Date.now() - startTime;
        analysis = extractJsonObject<any>(retry.content);
      }

      if (!analysis) {
        throw new Error(`${model}: Invalid JSON response after retry`);
      }

      await db.poemAnalysis.create({
        data: {
          poemId: params.poemId,
          model: model as "CLAUDE" | "GPT" | "GEMINI",
          literaryAnalysis: analysis.literaryAnalysis || "",
          thematicAnalysis: analysis.thematicAnalysis || "",
          emotionalAnalysis: analysis.emotionalAnalysis || "",
          culturalAnalysis: analysis.culturalAnalysis || "",
          hebrewAnalysis: analysis.hebrewAnalysis || null,
          rawResponse: analysis,
          tokensUsed: response.tokensUsed.total,
          cost: response.cost,
          durationMs,
          status: "COMPLETED",
        },
      });

      return { model, cost: response.cost };
    })
  );

  let completed = 0;
  let failed = 0;
  let totalCost = 0;

  for (const result of results) {
    if (result.status === "fulfilled") {
      completed++;
      totalCost += result.value.cost;
    } else {
      failed++;
      console.error("Analysis failed:", result.reason);
    }
  }

  return { completed, failed, totalCost };
}
