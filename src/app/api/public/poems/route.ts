import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);
  const skip = (page - 1) * limit;

  const [poems, total] = await Promise.all([
    db.poemFeature.findMany({
      where: { status: "PUBLISHED" },
      include: {
        poem: {
          select: {
            id: true,
            title: true,
            titleHe: true,
            author: true,
            authorHe: true,
            language: true,
            themes: true,
            content: true,
            contentHe: true,
            art: {
              select: { id: true, style: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    db.poemFeature.count({ where: { status: "PUBLISHED" } }),
  ]);

  return NextResponse.json({
    poems: poems.map((f) => ({
      slug: f.slug,
      ...f.poem,
      publishedAt: f.publishedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
