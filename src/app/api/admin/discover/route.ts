import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getLLMAdapter } from "@/lib/llm";
import { extractJsonObject } from "@/lib/pipeline/utils";
import { RegistryPoem } from "@/config/poem-registry";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { poet, language, action } = await request.json();

  if (action === "add") {
    return handleAdd(request);
  }

  if (!poet || !language) {
    return NextResponse.json(
      { error: "poet and language are required" },
      { status: 400 }
    );
  }

  const llm = getLLMAdapter("gemini-3-flash");

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

${langInstruction}

Respond with a JSON object: {"poems": [...]}"`,
    { temperature: 0.3, maxTokens: 4000 }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = extractJsonObject<any>(response.content);
  const poems: RegistryPoem[] = result?.poems || [];

  return NextResponse.json({ poems, cost: response.cost });
}

async function handleAdd(request: NextRequest) {
  const { poems } = await request.json();

  if (!Array.isArray(poems) || poems.length === 0) {
    return NextResponse.json(
      { error: "poems array is required" },
      { status: 400 }
    );
  }

  const registryPath = path.join(
    process.cwd(),
    "src/config/poem-registry.ts"
  );

  const content = fs.readFileSync(registryPath, "utf-8");

  // Build new entries
  const newEntries = poems
    .map((p: RegistryPoem) => {
      const fields: string[] = [
        `title: ${JSON.stringify(p.title)}`,
      ];
      if (p.titleHe) fields.push(`titleHe: ${JSON.stringify(p.titleHe)}`);
      fields.push(`author: ${JSON.stringify(p.author)}`);
      if (p.authorHe) fields.push(`authorHe: ${JSON.stringify(p.authorHe)}`);
      fields.push(`language: ${JSON.stringify(p.language)}`);
      fields.push(`themes: ${JSON.stringify(p.themes)}`);
      return `  { ${fields.join(", ")} },`;
    })
    .join("\n");

  // Insert before the closing ];
  const updated = content.replace(
    /\n];\s*$/,
    `\n\n  // Added via admin discover\n${newEntries}\n];\n`
  );

  fs.writeFileSync(registryPath, updated, "utf-8");

  return NextResponse.json({ added: poems.length });
}
