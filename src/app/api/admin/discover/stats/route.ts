import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { POEM_REGISTRY } from "@/config/poem-registry";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  // Combine static registry + DB registry
  const dbEntries = await db.poemRegistry.findMany();

  const allPoems = [
    ...POEM_REGISTRY,
    ...dbEntries.map((e) => ({
      title: e.title,
      titleHe: e.titleHe,
      author: e.author,
      authorHe: e.authorHe,
      language: e.language as "EN" | "HE",
      themes: e.themes as string[],
    })),
  ];

  const total = allPoems.length;
  const he = allPoems.filter((p) => p.language === "HE").length;
  const en = allPoems.filter((p) => p.language === "EN").length;

  const poetCounts = new Map<string, number>();
  for (const p of allPoems) {
    const name = p.authorHe || p.author;
    poetCounts.set(name, (poetCounts.get(name) || 0) + 1);
  }

  const poets = [...poetCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    total,
    he,
    en,
    poets,
    static: POEM_REGISTRY.length,
    db: dbEntries.length,
  });
}
