import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { obliterateQueue } from "@/lib/pipeline/queue";

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  await obliterateQueue();
  return NextResponse.json({ success: true });
}
