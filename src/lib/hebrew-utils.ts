/**
 * Replace English AI model names with Hebrew transliterations.
 * Prevents RTL text flow from breaking when English words appear inline.
 */
const MODEL_NAME_MAP: [RegExp, string][] = [
  [/\bGPT-4o\b/g, "ג׳י פי טי-4o"],
  [/\bGPT\b/g, "ג׳י פי טי"],
  [/\bClaude\b/g, "קלוד"],
  [/\bGemini\b/g, "ג׳מיני"],
];

export function hebrewifyModelNames(text: string): string {
  let result = text;
  for (const [pattern, replacement] of MODEL_NAME_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
