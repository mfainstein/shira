import {
  ResearchAdapter,
  ResearchQuery,
  ResearchResult,
  ResearchSource,
  getDomainCredibility,
} from "./types";

const EXA_API_URL = "https://api.exa.ai/search";

interface ExaResult {
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
}

interface ExaResponse {
  results: ExaResult[];
}

export class ExaAdapter implements ResearchAdapter {
  readonly toolId = "exa";
  readonly name = "Exa";

  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.EXA_API_KEY;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async search(query: ResearchQuery): Promise<ResearchResult> {
    if (!this.apiKey) {
      throw new Error("Exa API key not configured");
    }

    const searchQuery = query.context
      ? `${query.context}: ${query.query}`
      : query.query;

    const response = await fetch(EXA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({
        query: searchQuery,
        numResults: query.maxResults || 10,
        useAutoprompt: true,
        type: "neural",
        contents: {
          text: { maxCharacters: 1000 },
          highlights: { numSentences: 3 },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Exa API error: ${response.status} - ${error}`);
    }

    const data: ExaResponse = await response.json();

    const sources: ResearchSource[] = data.results.map((result) => ({
      url: result.url,
      title: result.title,
      snippet:
        result.highlights?.join(" ") || result.text?.substring(0, 300) || "",
      publishedDate: result.publishedDate,
      author: result.author,
      credibility: getDomainCredibility(result.url),
    }));

    return {
      query: query.query,
      sources,
      cost: 0.001,
      tool: this.toolId,
    };
  }
}

export const exa = new ExaAdapter();
