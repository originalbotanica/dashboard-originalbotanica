/**
 * Post-processing sanitizers for LLM output.
 *
 * Even with explicit prompt rules forbidding em-dashes, Claude
 * occasionally produces them. The Original Botanica brand voice doc is
 * strict: no em-dashes or en-dashes in any user-facing copy. This module
 * is the defense-in-depth layer applied after generation, before persistence.
 */

/**
 * Replace em-dashes and en-dashes with safer punctuation.
 * Spaced clause-breaks become periods. Bare or compact dashes become commas.
 * Regular hyphens (like in "family-owned") are left intact.
 */
export function stripDashes(text: string): string {
  if (!text) return text;
  return text
    .replace(/[ \t]+[—–][ \t]+/g, ". ")
    .replace(/[—–]/g, ", ");
}

/**
 * Apply stripDashes to a structured object's string leaves, leaving
 * arrays and nested objects intact. Mutates and returns the input.
 */
export function sanitizeStringsDeep<T>(value: T): T {
  if (typeof value === "string") {
    return stripDashes(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeStringsDeep(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = { ...(value as Record<string, unknown>) };
    for (const key of Object.keys(out)) {
      out[key] = sanitizeStringsDeep(out[key]);
    }
    return out as T;
  }
  return value;
}
