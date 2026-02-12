export interface ResearchQuery {
  query: string;
  context?: string;
  maxResults?: number;
}

export interface ResearchSource {
  url: string;
  title: string;
  snippet: string;
  publishedDate?: string;
  author?: string;
  credibility?: "high" | "medium" | "low" | "unknown";
}

export interface ResearchResult {
  query: string;
  answer?: string;
  sources: ResearchSource[];
  tokensUsed?: number;
  cost?: number;
  tool: string;
}

export interface ResearchAdapter {
  readonly toolId: string;
  readonly name: string;

  search(query: ResearchQuery): Promise<ResearchResult>;
  isAvailable(): boolean;
}

export function getDomainCredibility(
  url: string
): "high" | "medium" | "low" | "unknown" {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    if (hostname.endsWith(".gov")) return "high";
    if (hostname.endsWith(".edu")) return "high";
    if (
      ["reuters.com", "bbc.com", "nytimes.com", "nature.com", "arxiv.org"].some(
        (d) => hostname.includes(d)
      )
    )
      return "high";
    if (
      ["wikipedia.org", "wired.com", "techcrunch.com"].some((d) =>
        hostname.includes(d)
      )
    )
      return "medium";
    return "unknown";
  } catch {
    return "unknown";
  }
}
