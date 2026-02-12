import { POETRYDB_CONFIG } from "@/config/pipeline";

const POETRYDB_BASE = POETRYDB_CONFIG.baseUrl;

export interface PoetryDBPoem {
  title: string;
  author: string;
  lines: string[];
  linecount: string;
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data && typeof data === "object" && "status" in data) return null;
    return data as T;
  } catch (error) {
    console.error(`[PoetryDB] Fetch failed for ${url}:`, error);
    return null;
  }
}

export async function searchByLines(
  searchTerm: string
): Promise<PoetryDBPoem[]> {
  const encoded = encodeURIComponent(searchTerm);
  const result = await fetchJSON<PoetryDBPoem[]>(
    `${POETRYDB_BASE}/lines/${encoded}`
  );
  return result || [];
}

export async function searchByAuthor(
  author: string,
  count = 10
): Promise<PoetryDBPoem[]> {
  const encoded = encodeURIComponent(author);
  const result = await fetchJSON<PoetryDBPoem[]>(
    `${POETRYDB_BASE}/author,poemcount/${encoded};${count}`
  );
  return result || [];
}

export async function searchByTitle(
  title: string
): Promise<PoetryDBPoem[]> {
  const encoded = encodeURIComponent(title);
  const result = await fetchJSON<PoetryDBPoem[]>(
    `${POETRYDB_BASE}/title/${encoded}`
  );
  return result || [];
}

export async function getRandomPoems(count = 5): Promise<PoetryDBPoem[]> {
  const result = await fetchJSON<PoetryDBPoem[]>(
    `${POETRYDB_BASE}/random/${count}`
  );
  return result || [];
}

export async function findPoemForThemes(
  themes: string[]
): Promise<PoetryDBPoem | null> {
  console.log(
    `[PoetryDB] Searching for poem matching themes: ${themes.join(", ")}`
  );

  for (const theme of themes.slice(0, 3)) {
    const searchTerms = POETRYDB_CONFIG.themeSearchTerms[theme.toLowerCase()];
    if (searchTerms) {
      const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      const poems = await searchByLines(term);

      const quality = poems.filter((p) =>
        POETRYDB_CONFIG.preferredAuthors.some(
          (a) =>
            p.author.toLowerCase().includes(a.toLowerCase()) ||
            a.toLowerCase().includes(p.author.toLowerCase())
        )
      );

      if (quality.length > 0) {
        const suitable = quality.filter((p) => {
          const lc = parseInt(p.linecount, 10);
          return lc >= 4 && lc <= 80;
        });
        if (suitable.length > 0) {
          const pick = suitable[Math.floor(Math.random() * suitable.length)];
          console.log(
            `[PoetryDB] Found via theme "${theme}": "${pick.title}" by ${pick.author}`
          );
          return pick;
        }
      }
    }
  }

  // Fallback: random preferred author
  const shuffledAuthors = [...POETRYDB_CONFIG.preferredAuthors].sort(
    () => Math.random() - 0.5
  );
  for (const author of shuffledAuthors.slice(0, 3)) {
    const poems = await searchByAuthor(author, 5);
    const suitable = poems.filter((p) => {
      const lc = parseInt(p.linecount, 10);
      return lc >= 4 && lc <= 80;
    });
    if (suitable.length > 0) {
      const pick = suitable[Math.floor(Math.random() * suitable.length)];
      console.log(
        `[PoetryDB] Found via author "${author}": "${pick.title}"`
      );
      return pick;
    }
  }

  // Last resort: random
  const random = await getRandomPoems(5);
  const suitable = random.filter((p) => {
    const lc = parseInt(p.linecount, 10);
    return lc >= 4 && lc <= 80;
  });
  if (suitable.length > 0) {
    return suitable[Math.floor(Math.random() * suitable.length)];
  }

  return null;
}

export function poetryDBToContent(poem: PoetryDBPoem): string {
  return poem.lines.join("\n");
}

export function guessThemes(poem: PoetryDBPoem): string[] {
  const text = poem.lines.join(" ").toLowerCase();
  const found: string[] = [];

  for (const [theme, terms] of Object.entries(
    POETRYDB_CONFIG.themeSearchTerms
  )) {
    if (terms.some((term) => text.includes(term))) {
      found.push(theme);
    }
  }

  if (found.length === 0) {
    found.push("reflection", "beauty");
  }

  return found.slice(0, 5);
}
