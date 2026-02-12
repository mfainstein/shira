import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { scheduleAnalysis } from "@/lib/pipeline/queue";

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
  const language: Language = Math.random() > 0.5 ? "HE" : "EN";

  const topic =
    language === "HE"
      ? randomChoice(HEBREW_THEMES)
      : randomChoice(ENGLISH_THEMES);

  const acquisitionMode: AcquisitionMode =
    Math.random() > 0.4 ? "found" : "ai_generated";

  const artStyle: ArtStyle = Math.random() > 0.3 ? "MINIMALIST" : "DALLE";

  const sourceModel = randomChoice(SOURCE_MODELS);

  return { language, topic, acquisitionMode, artStyle, sourceModel };
}

function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // No secret configured = allow

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;

  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") === cronSecret) return true;

  return false;
}

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}

async function handleCron(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scheduled: Array<{
    jobId: string;
    language: string;
    mode: string;
    topic: string;
    artStyle: string;
  }> = [];

  try {
    const poemsToGenerate = randomInt(1, 3);

    for (let i = 0; i < poemsToGenerate; i++) {
      const params = getRandomParams();

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

      // Schedule via BullMQ
      const bullJobId = await scheduleAnalysis({
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
      });

      // Store BullMQ job ID
      await db.analysisJob.update({
        where: { id: analysisJob.id },
        data: { jobId: bullJobId },
      });

      scheduled.push({
        jobId: analysisJob.id,
        language: params.language,
        mode: params.acquisitionMode,
        topic: params.topic,
        artStyle: params.artStyle,
      });
    }

    return NextResponse.json({
      success: true,
      scheduled: scheduled.length,
      jobs: scheduled,
    });
  } catch (error) {
    console.error("[Auto-Generate Cron] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to schedule poems",
        detail: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
