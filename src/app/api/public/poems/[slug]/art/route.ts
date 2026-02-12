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

  const art = await db.poemArt.findFirst({
    where: { poemId: feature.poemId, status: "COMPLETED" },
    select: { imageData: true, style: true },
  });

  if (!art || !art.imageData) {
    return NextResponse.json({ error: "No art available" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(art.imageData), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
