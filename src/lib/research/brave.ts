import {
  ResearchAdapter,
  ResearchQuery,
  ResearchResult,
  ResearchSource,
  getDomainCredibility,
} from "./types";

const BRAVE_API_URL = "https://api.search.brave.com/res/v1/web/search";

interface BraveResult {
  title: string;
  url: string;
  description: string;
  age?: string;
  page_age?: string;
  extra_snippets?: string[];
}

interface BraveResponse {
  web?: { results: BraveResult[] };
}

export class BraveAdapter implements ResearchAdapter {
  readonly toolId = "brave";
  readonly name = "Brave Search";

  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.BRAVE_API_KEY;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async search(query: ResearchQuery): Promise<ResearchResult> {
    if (!this.apiKey) {
      throw new Error("Brave API key not configured");
    }

    const searchQuery = query.context
      ? `${query.context} ${query.query}`
      : query.query;

    const params = new URLSearchParams({
      q: searchQuery,
      count: String(query.maxResults || 10),
      safesearch: "moderate",
      text_decorations: "false",
    });

    const response = await fetch(`${BRAVE_API_URL}?${params}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Brave API error: ${response.status} - ${error}`);
    }

    const data: BraveResponse = await response.json();
    const results = data.web?.results || [];

    const sources: ResearchSource[] = results.map((result) => ({
      url: result.url,
      title: result.title,
      snippet: result.extra_snippets?.join(" ") || result.description,
      publishedDate: result.page_age || result.age,
      credibility: getDomainCredibility(result.url),
    }));

    return {
      query: query.query,
      sources,
      cost: 0.005,
      tool: this.toolId,
    };
  }
}

export const brave = new BraveAdapter();
