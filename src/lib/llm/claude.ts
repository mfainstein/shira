import Anthropic from "@anthropic-ai/sdk";
import {
  LLMAdapter,
  LLMMessage,
  LLMResponse,
  LLMOptions,
  calculateCost,
} from "./types";

const DEFAULT_MODEL = "claude-opus-4-5-20251101";

export class ClaudeAdapter implements LLMAdapter {
  private client: Anthropic;
  readonly provider = "anthropic";
  readonly modelId = "claude-opus-4-5";

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generate(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    return this.chat([{ role: "user", content: prompt }], options);
  }

  async chat(
    messages: LLMMessage[],
    options?: LLMOptions
  ): Promise<LLMResponse> {
    const systemPrompt =
      options?.systemPrompt ||
      messages.find((m) => m.role === "system")?.content;
    const chatMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const response = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature ?? 0.7,
      system: systemPrompt,
      messages: chatMessages,
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const cost = calculateCost("claude-opus-4-5", inputTokens, outputTokens);

    return {
      content,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      cost,
      model: DEFAULT_MODEL,
      finishReason: response.stop_reason || "end_turn",
    };
  }
}

export const claude = new ClaudeAdapter();
