import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import db from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();

  const feature = await db.poemFeature.findFirst({
    where: { poemId: id },
  });

  if (!feature) {
    return NextResponse.json(
      { error: "No feature found for this poem" },
      { status: 404 }
    );
  }

  const updated = await db.poemFeature.update({
    where: { id: feature.id },
    data: {
      status: "REJECTED",
      rejectionReason: body.reason || "No reason provided",
    },
  });

  return NextResponse.json(updated);
}
