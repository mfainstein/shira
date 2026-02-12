import { PrismaClient, PoemAnalysis } from "@prisma/client";
import { claude } from "@/lib/llm";

interface CompareResult {
  comparisonId: string;
  cost: number;
}

export async function compareAnalyses(
  db: PrismaClient,
  params: {
    poemId: string;
    title: string;
    language: "EN" | "HE";
  }
): Promise<CompareResult> {
  const analyses = await db.poemAnalysis.findMany({
    where: { poemId: params.poemId, status: "COMPLETED" },
  });

  if (analyses.length < 2) {
    throw new Error("Need at least 2 analyses to compare");
  }

  const languageInstruction =
    params.language === "HE"
      ? "IMPORTANT: Write the entire comparison in Hebrew."
      : "Write the comparison in English.";

  const analysesText = analyses
    .map(
      (a: PoemAnalysis) => `
=== ${a.model} Analysis ===
Literary: ${a.literaryAnalysis}
Thematic: ${a.thematicAnalysis}
Emotional: ${a.emotionalAnalysis}
Cultural: ${a.culturalAnalysis}
${a.hebrewAnalysis ? `Hebrew Devices: ${a.hebrewAnalysis}` : ""}`
    )
    .join("\n\n");

  const prompt = `You are a meta-critic comparing three AI analyses of the poem "${params.title}".

${languageInstruction}

Here are the analyses from three different AI models:

${analysesText}

Provide a comparison in the following JSON format:
{
  "comparisonContent": "A flowing, essay-style comparison (3-5 paragraphs) discussing how the three models approached the poem differently, what unique insights each brought, and what this tells us about AI literary analysis.",
  "agreements": ["Point 1 all models agree on", "Point 2 all models agree on", ...],
  "disagreements": ["Area where models diverge with explanation", ...],
  "insights": [
    {"model": "CLAUDE", "insight": "Unique insight from Claude"},
    {"model": "GPT", "insight": "Unique insight from GPT"},
    {"model": "GEMINI", "insight": "Unique insight from Gemini"}
  ]
}

Respond ONLY with valid JSON.`;

  const response = await claude.generate(prompt, {
    temperature: 0.4,
    maxTokens: 4096,
  });

  const jsonMatch = response.content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse comparison response");
  }

  const comparison = JSON.parse(jsonMatch[0]);

  const created = await db.poemComparison.create({
    data: {
      poemId: params.poemId,
      comparisonContent: comparison.comparisonContent || "",
      agreements: comparison.agreements || [],
      disagreements: comparison.disagreements || [],
      insights: comparison.insights || [],
      model: "CLAUDE",
      tokensUsed: response.tokensUsed.total,
      cost: response.cost,
    },
  });

  return {
    comparisonId: created.id,
    cost: response.cost,
  };
}
