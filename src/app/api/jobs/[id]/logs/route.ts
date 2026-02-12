import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  const logs = await db.jobLog.findMany({
    where: { jobId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(logs);
}
