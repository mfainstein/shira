import { PrismaClient } from "@prisma/client";
import { POEM_REGISTRY, RegistryPoem } from "@/config/poem-registry";

function normalizeForDedup(s: string): string {
  return s
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9\u0590-\u05ff ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pick a random un-acquired poem from the registry (static + DB).
 * Checks existing DB poems (title+author) to avoid duplicates.
 */
export async function pickRegistryPoem(
  db: PrismaClient,
  language: "EN" | "HE"
): Promise<RegistryPoem | null> {
  // Combine static registry + DB registry entries
  const dbEntries = await db.poemRegistry.findMany({
    where: { language, acquired: false },
  });

  const candidates: RegistryPoem[] = [
    ...POEM_REGISTRY.filter((p) => p.language === language),
    ...dbEntries.map((e) => ({
      title: e.title,
      titleHe: e.titleHe || undefined,
      author: e.author,
      authorHe: e.authorHe || undefined,
      language: e.language as "EN" | "HE",
      themes: (e.themes as string[]) || [],
    })),
  ];

  if (candidates.length === 0) return null;

  // Get existing acquired poems to check against
  const existingPoems = await db.poem.findMany({
    select: { title: true, author: true },
    take: 500,
  });

  const existingKeys = new Set(
    existingPoems.map(
      (p) => `${normalizeForDedup(p.title)}::${normalizeForDedup(p.author)}`
    )
  );

  // Filter out already-acquired poems
  const available = candidates.filter((p) => {
    const key = `${normalizeForDedup(p.title)}::${normalizeForDedup(p.author)}`;
    return !existingKeys.has(key);
  });

  if (available.length === 0) {
    console.log(
      `[Registry] No un-acquired ${language} poems left in registry (${candidates.length} total)`
    );
    return null;
  }

  // Pick random from available
  const pick = available[Math.floor(Math.random() * available.length)];
  console.log(
    `[Registry] Picked: "${pick.title}" by ${pick.author} (${available.length} available)`
  );

  // Mark as acquired in DB registry if it came from there
  const dbMatch = dbEntries.find(
    (e) => e.title === pick.title && e.author === pick.author
  );
  if (dbMatch) {
    await db.poemRegistry.update({
      where: { id: dbMatch.id },
      data: { acquired: true },
    });
  }

  return pick;
}

/**
 * Build a specific search query for a registry poem.
 * Uses exact title + author for precise web search.
 */
export function buildRegistrySearchQuery(poem: RegistryPoem): string {
  if (poem.searchQuery) return poem.searchQuery;

  if (poem.language === "HE") {
    const title = poem.titleHe || poem.title;
    const author = poem.authorHe || poem.author;
    return `"${title}" "${author}" שיר טקסט מלא`;
  }

  return `"${poem.title}" "${poem.author}" poem full text`;
}
