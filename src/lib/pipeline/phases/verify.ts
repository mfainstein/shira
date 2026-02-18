import { PrismaClient } from "@prisma/client";
import { getLLMAdapter } from "@/lib/llm";
import { researchWithFallback } from "@/lib/research";
import { extractJsonObject } from "../utils";
import { acquireAIPoem } from "./acquire";

export interface VerifyResult {
  status: "verified" | "corrected" | "rejected";
  poemId: string;
  title: string;
  content: string;
  themes: string[];
  sourceUrl?: string;
  cost: number;
}

export async function verifyPoem(
  db: PrismaClient,
  params: {
    poemId: string;
    title: string;
    titleHe?: string;
    author: string;
    authorHe?: string;
    content: string;
    contentHe?: string;
    language: "EN" | "HE";
    acquisitionMode: "found" | "ai_generated";
  }
): Promise<VerifyResult> {
  // Skip verification for AI-generated poems
  if (params.acquisitionMode === "ai_generated") {
    return {
      status: "verified",
      poemId: params.poemId,
      title: params.title,
      content: params.content,
      themes: [],
      cost: 0,
    };
  }

  // Check if poem was sourced from PoetryDB (reliable structured API)
  const poem = await db.poem.findUnique({ where: { id: params.poemId } });
  if (!poem) {
    throw new Error(`Poem ${params.poemId} not found during verification`);
  }

  // PoetryDB poems don't need verification — they come from a curated API
  const isPoetryDB =
    poem.source === "FOUND" &&
    poem.language === "EN" &&
    !poem.sourceUrl; // PoetryDB poems have no sourceUrl set during creation
  if (isPoetryDB) {
    return {
      status: "verified",
      poemId: params.poemId,
      title: params.title,
      content: params.content,
      themes: poem.themes as string[],
      cost: 0,
    };
  }

  // Research the poem for verification
  const displayTitle = params.language === "HE"
    ? (params.titleHe || params.title)
    : params.title;
  const displayAuthor = params.language === "HE"
    ? (params.authorHe || params.author)
    : params.author;

  const searchQuery = params.language === "HE"
    ? `"${displayTitle}" "${displayAuthor}" שיר טקסט מלא`
    : `"${displayTitle}" "${displayAuthor}" poem full text`;

  let totalCost = 0;

  const research = await researchWithFallback({
    query: searchQuery,
    context: "Verifying poem attribution and text accuracy",
    maxResults: 5,
  });
  totalCost += research.cost || 0;

  // Ask LLM to verify the poem against research results
  const llm = getLLMAdapter("claude-opus-4-5");

  const poemContent = params.language === "HE"
    ? (params.contentHe || params.content)
    : params.content;

  const verifyResponse = await llm.generate(
    `You are verifying whether a poem was correctly attributed and transcribed.

POEM TO VERIFY:
Title: ${displayTitle}
Author: ${displayAuthor}
Text:
${poemContent}

RESEARCH RESULTS:
${research.answer || "No direct answer found."}
Sources: ${research.sources.map((s) => `[${s.url || ""}] ${s.snippet}`).join("\n")}

INSTRUCTIONS:
1. Check if the author attribution is correct — does this poem actually belong to this author?
2. Check if the poem text is accurate — does it match what's found online, or was it fabricated/paraphrased?
3. If the poem is correct, respond with status "verified".
4. If the author or text is wrong but you can correct it from the research, respond with status "corrected" and provide the fixed data.
5. If you cannot verify the poem at all (no evidence it exists, or the text appears fabricated), respond with status "rejected".

Respond in JSON:
{
  "status": "verified" | "corrected" | "rejected",
  "reason": "brief explanation",
  "correctedTitle": "only if corrected",
  "correctedTitleHe": "only if corrected, Hebrew title",
  "correctedAuthor": "only if corrected",
  "correctedAuthorHe": "only if corrected, Hebrew author name",
  "correctedContent": "only if corrected, full corrected text",
  "correctedContentHe": "only if corrected, full corrected Hebrew text",
  "sourceUrl": "URL where the poem was found (from research sources)"
}`,
    { temperature: 0.1 }
  );
  totalCost += verifyResponse.cost;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = extractJsonObject<any>(verifyResponse.content);
  if (!result) {
    console.warn("[Verify] Failed to parse verification response, treating as verified");
    return {
      status: "verified",
      poemId: params.poemId,
      title: params.title,
      content: params.content,
      themes: poem.themes as string[],
      cost: totalCost,
    };
  }

  const sourceUrl = result.sourceUrl || null;

  if (result.status === "verified") {
    console.log(`[Verify] Poem verified: "${displayTitle}" by ${displayAuthor}`);
    // Update sourceUrl if we found one
    if (sourceUrl) {
      await db.poem.update({
        where: { id: params.poemId },
        data: { sourceUrl },
      });
    }
    return {
      status: "verified",
      poemId: params.poemId,
      title: params.title,
      content: params.content,
      themes: poem.themes as string[],
      sourceUrl: sourceUrl || undefined,
      cost: totalCost,
    };
  }

  if (result.status === "corrected") {
    console.log(`[Verify] Poem corrected: "${displayTitle}" by ${displayAuthor} — ${result.reason}`);
    const updateData: Record<string, unknown> = {};
    if (result.correctedTitle) updateData.title = result.correctedTitle;
    if (result.correctedTitleHe) updateData.titleHe = result.correctedTitleHe;
    if (result.correctedAuthor) updateData.author = result.correctedAuthor;
    if (result.correctedAuthorHe) updateData.authorHe = result.correctedAuthorHe;
    if (result.correctedContent) updateData.content = result.correctedContent;
    if (result.correctedContentHe) updateData.contentHe = result.correctedContentHe;
    if (sourceUrl) updateData.sourceUrl = sourceUrl;

    if (Object.keys(updateData).length > 0) {
      await db.poem.update({
        where: { id: params.poemId },
        data: updateData,
      });
    }

    const updatedPoem = await db.poem.findUnique({ where: { id: params.poemId } });
    const updatedTitle = params.language === "HE"
      ? (updatedPoem?.titleHe || updatedPoem?.title || params.title)
      : (updatedPoem?.title || params.title);
    const updatedContent = params.language === "HE"
      ? (updatedPoem?.contentHe || updatedPoem?.content || params.content)
      : (updatedPoem?.content || params.content);

    return {
      status: "corrected",
      poemId: params.poemId,
      title: updatedTitle,
      content: updatedContent,
      themes: (updatedPoem?.themes as string[]) || (poem.themes as string[]),
      sourceUrl: sourceUrl || undefined,
      cost: totalCost,
    };
  }

  // Rejected — delete the bad poem and fall back to AI generation
  console.log(`[Verify] Poem rejected: "${displayTitle}" by ${displayAuthor} — ${result.reason}`);
  await db.poem.delete({ where: { id: params.poemId } });

  const aiResult = await acquireAIPoem(db, {
    topic: (poem.themes as string[]).join(", "),
    language: params.language,
  });

  return {
    status: "rejected",
    poemId: aiResult.poemId,
    title: aiResult.title,
    content: aiResult.content,
    themes: aiResult.themes,
    cost: totalCost + aiResult.cost,
  };
}
