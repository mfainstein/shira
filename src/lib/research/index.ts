import { ResearchAdapter, ResearchQuery, ResearchResult } from "./types";
import { perplexity, PerplexityAdapter } from "./perplexity";
import { exa, ExaAdapter } from "./exa";
import { brave, BraveAdapter } from "./brave";

export { perplexity, exa, brave };
export { PerplexityAdapter, ExaAdapter, BraveAdapter };
export * from "./types";

const adapters: ResearchAdapter[] = [perplexity, exa, brave];

export function getResearchAdapter(toolId: string): ResearchAdapter | null {
  return adapters.find((a) => a.toolId === toolId) || null;
}

export function getAvailableAdapters(): ResearchAdapter[] {
  return adapters.filter((a) => a.isAvailable());
}

export async function researchWithFallback(
  query: ResearchQuery,
  primaryToolId: string = "perplexity",
  enableFallback: boolean = true
): Promise<ResearchResult> {
  const primaryAdapter = getResearchAdapter(primaryToolId);

  if (primaryAdapter?.isAvailable()) {
    try {
      return await primaryAdapter.search(query);
    } catch (error) {
      console.warn(
        `Primary research tool ${primaryToolId} failed:`,
        error instanceof Error ? error.message : error
      );
      if (!enableFallback) throw error;
    }
  }

  if (enableFallback) {
    for (const adapter of adapters) {
      if (adapter.toolId === primaryToolId) continue;
      if (!adapter.isAvailable()) continue;
      try {
        console.log(`Falling back to ${adapter.name}`);
        return await adapter.search(query);
      } catch (error) {
        console.warn(
          `Fallback research tool ${adapter.toolId} failed:`,
          error instanceof Error ? error.message : error
        );
      }
    }
  }

  throw new Error("All research tools failed or unavailable");
}
