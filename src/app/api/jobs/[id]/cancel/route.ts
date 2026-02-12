import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import db from "@/lib/db";
import { cancelJob } from "@/lib/pipeline/queue";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  const job = await db.analysisJob.findUnique({ where: { id } });
  if (!job || !job.jobId) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const cancelled = await cancelJob(job.jobId);

  if (cancelled) {
    await db.analysisJob.update({
      where: { id },
      data: { status: "FAILED", errorMessage: "Cancelled by admin" },
    });
  }

  return NextResponse.json({ success: cancelled });
}
