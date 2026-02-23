/**
 * CLI tool to discover poems by a given poet using LLM.
 *
 * Usage:
 *   npx tsx scripts/discover-poems.ts "דוד אבידן"
 *   npx tsx scripts/discover-poems.ts "Robert Frost" --lang EN
 */

import Anthropic from "@anthropic-ai/sdk";

const poet = process.argv[2];
if (!poet) {
  console.error("Usage: npx tsx scripts/discover-poems.ts <poet-name> [--lang EN|HE]");
  process.exit(1);
}

const langFlag = process.argv.indexOf("--lang");
const language = langFlag !== -1 ? process.argv[langFlag + 1] : "HE";

async function main() {
  const client = new Anthropic();

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

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `List 12-15 notable, well-known poems by ${poet} that are suitable for literary analysis.

Choose poems that are:
- Complete and digestible (not too long — under 60 lines preferred)
- Widely anthologized and well-known
- Rich in literary devices and suitable for analysis

${langInstruction}

Respond with ONLY a JSON object: {"poems": [...]}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    console.error("Failed to parse response");
    console.error(text);
    process.exit(1);
  }

  const result = JSON.parse(match[0]);
  const poems = result.poems || [];

  console.log(`\n// ${poet} (${poems.length} poems)\n`);

  for (const p of poems) {
    const fields: string[] = [`title: ${JSON.stringify(p.title)}`];
    if (p.titleHe) fields.push(`titleHe: ${JSON.stringify(p.titleHe)}`);
    fields.push(`author: ${JSON.stringify(p.author)}`);
    if (p.authorHe) fields.push(`authorHe: ${JSON.stringify(p.authorHe)}`);
    fields.push(`language: ${JSON.stringify(p.language)}`);
    fields.push(`themes: ${JSON.stringify(p.themes)}`);
    console.log(`  { ${fields.join(", ")} },`);
  }

  console.log("");
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
