/**
 * Safely parse JSON from LLM responses.
 *
 * LLMs sometimes produce invalid JSON escape sequences when outputting
 * non-ASCII text (e.g., Hebrew). For example, `\ו` is not a valid JSON
 * escape. This function attempts a normal parse first, and on failure
 * strips invalid backslash escapes before retrying.
 */
export function safeJsonParse<T = unknown>(jsonString: string): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    // Remove backslashes that don't precede a valid JSON escape character.
    // Valid JSON escapes: " \ / b f n r t u
    const sanitized = jsonString.replace(
      /\\([^"\\/bfnrtu])/g,
      (_match, char) => char
    );
    return JSON.parse(sanitized);
  }
}

/**
 * Extract a JSON object from an LLM response string.
 *
 * Handles common LLM quirks:
 * - Markdown code fences (```json ... ```)
 * - Preamble text before JSON
 * - Invalid escape sequences (via safeJsonParse)
 */
export function extractJsonObject<T = unknown>(content: string): T | null {
  // Strip markdown code fences
  const stripped = content.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "");

  // Try to find a JSON object
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return safeJsonParse<T>(match[0]);
  } catch {
    return null;
  }
}
