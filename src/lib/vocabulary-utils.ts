/**
 * Normalize a word for vocabulary matching.
 * Used in both server-side (storage) and client-side (matching) to ensure consistency.
 *
 * Strips: punctuation, Hebrew niqqud/diacritics, Hebrew punctuation marks,
 * then lowercases. This ensures the same normalization happens when
 * vocabulary entries are stored and when poem words are matched.
 */
export function normalizeWord(word: string): string {
  return (
    word
      .toLowerCase()
      // Strip Hebrew niqqud / cantillation (U+0591–U+05C7)
      .replace(/[\u0591-\u05C7]/g, "")
      // Strip Hebrew punctuation: maqaf, geresh, gershayim
      .replace(/[־׳״]/g, "")
      // Strip common Latin/English punctuation
      .replace(/[.,;:!?()"""''«»\-—–…\[\]{}]/g, "")
      .trim()
  );
}
