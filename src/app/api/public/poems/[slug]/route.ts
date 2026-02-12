import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const feature = await db.poemFeature.findUnique({
    where: { slug },
    include: {
      poem: {
        include: {
          analyses: {
            where: { status: "COMPLETED" },
            select: {
              id: true,
              model: true,
              literaryAnalysis: true,
              thematicAnalysis: true,
              emotionalAnalysis: true,
              culturalAnalysis: true,
              hebrewAnalysis: true,
            },
          },
          art: {
            select: { id: true, style: true, drawCommands: true },
            take: 1,
          },
          comparison: {
            select: {
              comparisonContent: true,
              agreements: true,
              disagreements: true,
              insights: true,
            },
          },
        },
      },
    },
  });

  if (!feature || feature.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    slug: feature.slug,
    publishedAt: feature.publishedAt,
    poem: feature.poem,
  });
}
