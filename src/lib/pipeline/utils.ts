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
