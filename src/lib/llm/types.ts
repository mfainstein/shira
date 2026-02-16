export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  model: string;
  finishReason: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  jsonMode?: boolean;
}

export interface LLMAdapter {
  readonly provider: string;
  readonly modelId: string;

  generate(prompt: string, options?: LLMOptions): Promise<LLMResponse>;
  chat(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
}

export const MODEL_COSTS = {
  "claude-opus-4-5": { input: 5.0, output: 25.0 },
  "claude-sonnet-4-5": { input: 3.0, output: 15.0 },
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gemini-3-flash": { input: 0.1, output: 0.4 },
  "gemini-2-flash": { input: 0.075, output: 0.3 },
} as const;

export function calculateCost(
  model: keyof typeof MODEL_COSTS,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[model] || { input: 0, output: 0 };
  return (
    (inputTokens / 1_000_000) * costs.input +
    (outputTokens / 1_000_000) * costs.output
  );
}
