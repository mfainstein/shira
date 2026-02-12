import OpenAI from "openai";
import {
  LLMAdapter,
  LLMMessage,
  LLMResponse,
  LLMOptions,
  calculateCost,
} from "./types";

const DEFAULT_MODEL = "gpt-5.1";

export class OpenAIAdapter implements LLMAdapter {
  private client: OpenAI;
  readonly provider = "openai";
  readonly modelId = "gpt-5.1";

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generate(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    return this.chat([{ role: "user", content: prompt }], options);
  }

  async chat(
    messages: LLMMessage[],
    options?: LLMOptions
  ): Promise<LLMResponse> {
    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      [];

    if (options?.systemPrompt) {
      chatMessages.push({
        role: "system",
        content: options.systemPrompt,
      });
    }

    for (const msg of messages) {
      if (msg.role === "system" && options?.systemPrompt) {
        continue;
      }
      chatMessages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    const response = await this.client.chat.completions.create({
      model: DEFAULT_MODEL,
      max_completion_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature ?? 0.7,
      messages: chatMessages,
    });

    const content = response.choices[0]?.message?.content || "";
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const cost = calculateCost("gpt-5.1", inputTokens, outputTokens);

    return {
      content,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      cost,
      model: DEFAULT_MODEL,
      finishReason: response.choices[0]?.finish_reason || "stop",
    };
  }
}

export const openai = new OpenAIAdapter();
