/**
 * Auto-Generate Cron Worker
 *
 * Runs on a schedule (Railway cron or manual) to automatically:
 * 1. Pick random language (Hebrew or English)
 * 2. Pick random themes/topics
 * 3. Schedule the full pipeline: acquire → art → analyze (3 AIs) → compare → publish
 *
 * Usage:
 *   npx tsx workers/auto-generate.cron.ts
 *
 * Environment variables required:
 *   - DATABASE_URL
 *   - REDIS_URL
 */

import { PrismaClient } from "@prisma/client";
import { Queue } from "bullmq";
import Redis from "ioredis";

const db = new PrismaClient();

type ArtStyle = "MINIMALIST" | "DALLE";
type Language = "EN" | "HE";
type AcquisitionMode = "found" | "ai_generated";

const HEBREW_THEMES = [
  "אהבה,געגועים",
  "מולדת,ארץ ישראל",
  "טבע,עונות השנה",
  "זיכרון,נוסטלגיה",
  "ירושלים,קדושה",
  "מוות,אובדן",
  "תקווה,חלומות",
  "בדידות,ערגה",
  "ילדות,משפחה",
  "חירות,עצמאות",
  "לילה,כוכבים",
  "ים,מים",
  "מלחמה,שלום",
  "אלוהים,אמונה",
  "שירה,יצירה",
];

const ENGLISH_THEMES = [
  "love,longing",
  "nature,seasons",
  "death,mortality",
  "time,memory",
  "beauty,light",
  "loss,grief",
  "hope,dreams",
  "solitude,reflection",
  "war,peace",
  "childhood,innocence",
  "the sea,water",
  "night,stars",
  "freedom,journey",
  "faith,doubt",
  "art,creation",
];

const SOURCE_MODELS = ["claude-opus-4-5", "gpt-5.1", "gemini-3-flash"];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomParams() {
  // 50/50 Hebrew/English
  const language: Language = Math.random() > 0.5 ? "HE" : "EN";

  // Pick theme based on language
  const topic =
    language === "HE"
      ? randomChoice(HEBREW_THEMES)
      : randomChoice(ENGLISH_THEMES);

  // Weighted acquisition mode: 60% found, 40% AI-generated
  const acquisitionMode: AcquisitionMode =
    Math.random() > 0.4 ? "found" : "ai_generated";

  // Art style: 70% minimalist, 30% DALL-E
  const artStyle: ArtStyle = Math.random() > 0.3 ? "MINIMALIST" : "DALLE";

  // Random source model for AI-generated poems
  const sourceModel = randomChoice(SOURCE_MODELS);

  return {
    language,
    topic,
    acquisitionMode,
    artStyle,
    sourceModel,
  };
}

async function main() {
  console.log("[Shira Auto-Generate] Starting...");

  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL environment variable is required");
  }

  const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  const analysisQueue = new Queue("poetry-analysis", {
    connection: redis,
  });

  try {
    // Check how many jobs are already queued/active
    const [waiting, active] = await Promise.all([
      analysisQueue.getWaitingCount(),
      analysisQueue.getActiveCount(),
    ]);

    if (waiting + active >= 3) {
      console.log(
        `[Shira Auto-Generate] ${waiting + active} jobs already in queue, skipping`
      );
      return;
    }

    // Generate 1-3 poems per run
    const poemsToGenerate = randomInt(1, 3);
    console.log(
      `[Shira Auto-Generate] Generating ${poemsToGenerate} poem(s) this run`
    );

    for (let i = 0; i < poemsToGenerate; i++) {
      const params = getRandomParams();

      console.log(
        `[Shira Auto-Generate] Poem ${i + 1}: ${params.language} | ${params.acquisitionMode} | "${params.topic}" | ${params.artStyle}`
      );

      // Create AnalysisJob record
      const analysisJob = await db.analysisJob.create({
        data: {
          status: "QUEUED",
          currentPhase: "QUEUED",
          progress: 0,
          acquisitionMode: params.acquisitionMode,
          topic: params.topic,
          artStyle: params.artStyle,
          totalCost: 0,
        },
      });

      // Add to BullMQ queue
      const job = await analysisQueue.add(
        "analyze",
        {
          analysisJobId: analysisJob.id,
          poemId: "",
          params: {
            acquisitionMode: params.acquisitionMode,
            topic: params.topic,
            language: params.language,
            artStyle: params.artStyle,
            sourceModel:
              params.acquisitionMode === "ai_generated"
                ? params.sourceModel
                : undefined,
          },
        },
        {
          jobId: `poetry-${analysisJob.id}`,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        }
      );

      // Update job with BullMQ job ID
      await db.analysisJob.update({
        where: { id: analysisJob.id },
        data: { jobId: job.id },
      });

      console.log(
        `[Shira Auto-Generate] Scheduled job ${analysisJob.id} (queue: ${job.id})`
      );
    }

    console.log(
      `[Shira Auto-Generate] Successfully scheduled ${poemsToGenerate} poem(s)`
    );
  } finally {
    await analysisQueue.close();
    await redis.quit();
    await db.$disconnect();
  }

  console.log("[Shira Auto-Generate] Done!");
}

main().catch((error) => {
  console.error("[Shira Auto-Generate] Fatal error:", error);
  process.exit(1);
});
