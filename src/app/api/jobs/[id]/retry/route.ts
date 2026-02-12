import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import db from "@/lib/db";
import { retryJob } from "@/lib/pipeline/queue";

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

  const retried = await retryJob(job.jobId);

  if (retried) {
    await db.analysisJob.update({
      where: { id },
      data: { status: "QUEUED", errorMessage: null },
    });
  }

  return NextResponse.json({ success: retried });
}
