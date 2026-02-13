import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const feature = await db.poemFeature.findUnique({
    where: { slug },
    select: { poemId: true, status: true },
  });

  if (!feature || feature.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const audio = await db.poemAudio.findFirst({
    where: { poemId: feature.poemId, status: "COMPLETED" },
    select: { combinedData: true },
  });

  if (!audio || !audio.combinedData) {
    return NextResponse.json({ error: "No audio available" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(audio.combinedData), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
