/**
 * Backfill line explanations for existing published poems.
 *
 * Usage:
 *   npx tsx scripts/backfill-line-explanations.ts
 *
 * Requires DATABASE_URL (and LLM API keys) in environment.
 */

import { PrismaClient } from "@prisma/client";
import { generateLineExplanations } from "../src/lib/pipeline/phases/lineExplanations";

async function main() {
  const db = new PrismaClient();

  try {
    const features = await db.poemFeature.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 10,
      include: {
        poem: {
          select: {
            id: true,
            title: true,
            content: true,
            contentHe: true,
            language: true,
            lineExplanations: true,
          },
        },
      },
    });

    console.log(`Found ${features.length} published poems to backfill`);

    let totalCost = 0;

    for (const feature of features) {
      const { poem } = feature;

      if (poem.lineExplanations) {
        console.log(`[Skip] "${poem.title}" — already has line explanations`);
        continue;
      }

      const content =
        poem.language === "HE"
          ? poem.contentHe || poem.content
          : poem.content;

      console.log(`[Processing] "${poem.title}" (${poem.language})`);

      const result = await generateLineExplanations(db, {
        poemId: poem.id,
        content,
        language: poem.language as "EN" | "HE",
      });

      totalCost += result.cost;
      console.log(`  → ${result.lines} lines, cost: $${result.cost.toFixed(4)}`);
    }

    console.log(`\nDone! Total cost: $${totalCost.toFixed(4)}`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
