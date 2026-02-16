import { LLMAdapter } from "./types";
import { claude, ClaudeAdapter } from "./claude";
import { openai, OpenAIAdapter } from "./openai";
import { gemini, GeminiAdapter } from "./gemini";

export { claude, openai, gemini };
export { ClaudeAdapter, OpenAIAdapter, GeminiAdapter };
export * from "./types";

export function getLLMAdapter(modelId: string): LLMAdapter {
  switch (modelId) {
    case "claude-opus-4-5":
    case "claude-sonnet-4-5":
      return claude;
    case "gpt-4o":
      return openai;
    case "gemini-3-flash":
    case "gemini-2-flash":
      return gemini;
    default:
      console.warn(`Unknown model ID: ${modelId}, falling back to Claude`);
      return claude;
  }
}

export function getAllAdapters(): { model: string; adapter: LLMAdapter }[] {
  return [
    { model: "CLAUDE", adapter: claude },
    { model: "GPT", adapter: openai },
    { model: "GEMINI", adapter: gemini },
  ];
}

export const availableModels = [
  {
    id: "claude-opus-4-5",
    name: "Claude Opus 4.5",
    provider: "Anthropic",
    description: "Best for nuanced analysis and complex topics",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Strong multimodal model with reliable structured output",
  },
  {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    provider: "Google",
    description: "Fast frontier-class performance",
  },
];
