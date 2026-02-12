import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getQueueStatus } from "@/lib/pipeline/queue";

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const status = await getQueueStatus();
  return NextResponse.json(status);
}
