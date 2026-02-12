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

  const poem = await db.poem.findUnique({
    where: { id },
    include: {
      analyses: true,
      art: true,
      comparison: true,
      feature: true,
      jobs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!poem) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(poem);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();

  const poem = await db.poem.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(poem);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  await db.poem.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
