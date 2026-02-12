import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import db from "@/lib/db";
import { scheduleAnalysis } from "@/lib/pipeline/queue";

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const poems = await db.poem.findMany({
    include: {
      analyses: { select: { id: true, model: true, status: true } },
      art: { select: { id: true, style: true, status: true } },
      feature: { select: { id: true, slug: true, status: true } },
      jobs: {
        select: { id: true, status: true, progress: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(poems);
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const {
    acquisitionMode = "found",
    topic,
    language = "EN",
    artStyle = "MINIMALIST",
    poemId,
    sourceModel,
  } = body;

  // Create a placeholder poem if none provided
  let targetPoemId = poemId;
  if (!targetPoemId) {
    const poem = await db.poem.create({
      data: {
        title: topic ? `Poem about ${topic}` : "Untitled",
        author: "Pending",
        content: "Pending acquisition...",
        language,
        source: acquisitionMode === "found" ? "FOUND" : "AI_GENERATED",
        themes: topic ? topic.split(",").map((t: string) => t.trim()) : [],
      },
    });
    targetPoemId = poem.id;
  }

  // Create analysis job record
  const analysisJob = await db.analysisJob.create({
    data: {
      poemId: targetPoemId,
      status: "QUEUED",
      acquisitionMode,
      topic,
      artStyle,
    },
  });

  // Schedule the job
  const bullJobId = await scheduleAnalysis({
    analysisJobId: analysisJob.id,
    poemId: targetPoemId,
    params: {
      acquisitionMode,
      topic,
      language,
      artStyle,
      sourceModel,
    },
  });

  // Update with BullMQ job ID
  await db.analysisJob.update({
    where: { id: analysisJob.id },
    data: { jobId: bullJobId },
  });

  return NextResponse.json({
    jobId: analysisJob.id,
    bullJobId,
    poemId: targetPoemId,
  });
}
