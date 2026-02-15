import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  LLMAdapter,
  LLMMessage,
  LLMResponse,
  LLMOptions,
  calculateCost,
} from "./types";

const DEFAULT_MODEL = "gemini-3-flash-preview";

export class GeminiAdapter implements LLMAdapter {
  private client: GoogleGenerativeAI;
  readonly provider = "google";
  readonly modelId = "gemini-3-flash";

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
  }

  async generate(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    return this.chat([{ role: "user", content: prompt }], options);
  }

  async chat(
    messages: LLMMessage[],
    options?: LLMOptions
  ): Promise<LLMResponse> {
    const systemInstruction =
      options?.systemPrompt ||
      messages.find((m) => m.role === "system")?.content;

    const model = this.client.getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: systemInstruction || undefined,
      generationConfig: {
        maxOutputTokens: options?.maxTokens || 4096,
        temperature: options?.temperature ?? 0.7,
        ...(options?.jsonMode && { responseMimeType: "application/json" }),
      },
    });

    const history = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const lastMessage = history.pop();
    if (!lastMessage || lastMessage.role !== "user") {
      throw new Error("Last message must be from user");
    }

    const chat = model.startChat({
      history: history as {
        role: "user" | "model";
        parts: { text: string }[];
      }[],
    });

    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = result.response;
    const content = response.text();

    const inputTokens = Math.ceil(
      messages.reduce((acc, m) => acc + m.content.length, 0) / 4
    );
    const outputTokens = Math.ceil(content.length / 4);
    const cost = calculateCost("gemini-3-flash", inputTokens, outputTokens);

    return {
      content,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      cost,
      model: DEFAULT_MODEL,
      finishReason: response.candidates?.[0]?.finishReason || "STOP",
    };
  }
}

export const gemini = new GeminiAdapter();
