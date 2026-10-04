/**
 * No-advice guard: scans Gemini output for directive language.
 * Only flags declarative statements, not questions.
 */

const ADVICE_PATTERNS = [
  /\byou should\b/i,
  /\bi recommend\b/i,
  /\bbest option\b/i,
  /\bbetter to\b/i,
  /\bi suggest\b/i,
  /\bgo with\b/i,
  /\byou ought\b/i,
  /\bthe best choice\b/i,
];

function isQuestion(sentence: string): boolean {
  return sentence.trimEnd().endsWith("?");
}

/**
 * Returns true if the text contains advice language in non-question sentences.
 */
export function containsAdvice(text: string): boolean {
  // Split into sentences (rough split on . ! ? and newlines)
  const sentences = text.split(/(?<=[.!?\n])\s+/);
  for (const sentence of sentences) {
    if (isQuestion(sentence)) continue;
    for (const pattern of ADVICE_PATTERNS) {
      if (pattern.test(sentence)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Scans all string fields in the analysis response for advice language.
 * Returns the offending field paths, or an empty array if clean.
 */
export function findAdviceInResponse(obj: unknown, path = ""): string[] {
  const results: string[] = [];
  if (typeof obj === "string") {
    if (containsAdvice(obj)) {
      results.push(path);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      results.push(...findAdviceInResponse(item, `${path}[${i}]`));
    });
  } else if (obj !== null && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      results.push(...findAdviceInResponse(value, path ? `${path}.${key}` : key));
    }
  }
  return results;
}

/**
 * Removes items from arrays that contain advice language.
 * Returns a cleaned copy of the response.
 */
export function stripAdviceItems<T>(response: T): T {
  if (typeof response !== "object" || response === null) return response;

  const cleaned = { ...response } as Record<string, unknown>;

  for (const [key, value] of Object.entries(cleaned)) {
    if (Array.isArray(value)) {
      cleaned[key] = value.filter((item) => {
        if (typeof item === "string") return !containsAdvice(item);
        if (typeof item === "object" && item !== null) {
          return findAdviceInResponse(item).length === 0;
        }
        return true;
      });
    }
  }

  return cleaned as T;
}
