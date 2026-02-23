import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getLLMAdapter } from "@/lib/llm";
import { extractJsonObject } from "@/lib/pipeline/utils";
import { RegistryPoem, POEM_REGISTRY } from "@/config/poem-registry";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const { poet, language, action } = body;

  if (action === "add") {
    return handleAdd(body.poems);
  }

  if (!poet || !language) {
    return NextResponse.json(
      { error: "poet and language are required" },
      { status: 400 }
    );
  }

  const llm = getLLMAdapter("gemini-3-flash");

  // Build exclusion list from static registry + DB registry
  const staticTitles = POEM_REGISTRY
    .filter((p) => p.author.toLowerCase().includes(poet.toLowerCase()) ||
                   (p.authorHe && p.authorHe.includes(poet)))
    .map((p) => p.title);

  const dbEntries = await db.poemRegistry.findMany({
    where: {
      OR: [
        { author: { contains: poet, mode: "insensitive" } },
        { authorHe: { contains: poet } },
      ],
    },
    select: { title: true },
  });

  const allExisting = [...staticTitles, ...dbEntries.map((e) => e.title)];
  const exclusionNote = allExisting.length > 0
    ? `\nWe already have these poems in our registry, suggest DIFFERENT ones: ${allExisting.join(", ")}`
    : "";

  const langInstruction =
    language === "HE"
      ? `The poet writes in Hebrew. For each poem provide:
- "title": English title
- "titleHe": Hebrew title (REQUIRED)
- "author": English name
- "authorHe": Hebrew name (REQUIRED)
- "language": "HE"
- "themes": array of 2-3 English theme words`
      : `The poet writes in English. For each poem provide:
- "title": the poem title
- "author": the poet's full name
- "language": "EN"
- "themes": array of 2-3 English theme words`;

  const response = await llm.generate(
    `List 12-15 notable, well-known poems by ${poet} that are suitable for literary analysis.

Choose poems that are:
- Complete and digestible (not too long — under 60 lines preferred)
- Widely anthologized and well-known
- Rich in literary devices and suitable for analysis
${exclusionNote}

${langInstruction}

Respond with a JSON object: {"poems": [...]}"`,
    { temperature: 0.3, maxTokens: 4000 }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = extractJsonObject<any>(response.content);
  const poems: RegistryPoem[] = result?.poems || [];

  return NextResponse.json({ poems, cost: response.cost });
}

async function handleAdd(poems: RegistryPoem[]) {
  if (!Array.isArray(poems) || poems.length === 0) {
    return NextResponse.json(
      { error: "poems array is required" },
      { status: 400 }
    );
  }

  let added = 0;
  for (const p of poems) {
    try {
      await db.poemRegistry.create({
        data: {
          title: p.title,
          titleHe: p.titleHe || null,
          author: p.author,
          authorHe: p.authorHe || null,
          language: p.language,
          themes: p.themes || [],
        },
      });
      added++;
    } catch {
      // Unique constraint violation — already exists, skip
    }
  }

  return NextResponse.json({ added });
}
