import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { POEM_REGISTRY } from "@/config/poem-registry";

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const total = POEM_REGISTRY.length;
  const he = POEM_REGISTRY.filter((p) => p.language === "HE").length;
  const en = POEM_REGISTRY.filter((p) => p.language === "EN").length;

  // Count by poet
  const poetCounts = new Map<string, number>();
  for (const p of POEM_REGISTRY) {
    const name = p.authorHe || p.author;
    poetCounts.set(name, (poetCounts.get(name) || 0) + 1);
  }

  const poets = [...poetCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ total, he, en, poets });
}
