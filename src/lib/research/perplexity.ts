import {
  ResearchAdapter,
  ResearchQuery,
  ResearchResult,
  ResearchSource,
  getDomainCredibility,
} from "./types";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

interface PerplexityResponse {
  choices: {
    message: { content: string };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
}

export class PerplexityAdapter implements ResearchAdapter {
  readonly toolId = "perplexity";
  readonly name = "Perplexity";

  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async search(query: ResearchQuery): Promise<ResearchResult> {
    if (!this.apiKey) {
      throw new Error("Perplexity API key not configured");
    }

    const systemPrompt = query.context
      ? `You are a research assistant. Context: ${query.context}. Provide accurate, well-sourced information.`
      : "You are a research assistant. Provide accurate, well-sourced information.";

    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query.query },
        ],
        temperature: 0.2,
        max_tokens: 2048,
        return_citations: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${error}`);
    }

    const data: PerplexityResponse = await response.json();
    const answer = data.choices[0]?.message?.content || "";
    const citations = data.citations || [];

    const sources: ResearchSource[] = citations.map((url, index) => ({
      url,
      title: `Source ${index + 1}`,
      snippet: "",
      credibility: getDomainCredibility(url),
    }));

    const cost = (data.usage.total_tokens / 1_000_000) * 0.2;

    return {
      query: query.query,
      answer,
      sources,
      tokensUsed: data.usage.total_tokens,
      cost,
      tool: this.toolId,
    };
  }
}

export const perplexity = new PerplexityAdapter();
