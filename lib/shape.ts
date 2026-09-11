/**
 * Coerce a stored CMS document to the SHAPE of its fallback.
 *
 * The admin editor can legitimately save a list field as "" (e.g. a repeater row
 * added but never filled), which would make `.map()`/`.join()` throw during
 * render. Every caller has a correctly-shaped fallback, so we use it as the
 * schema: wherever the fallback says "array" but the stored value isn't one, we
 * substitute an empty array. Recursing through `fallback[0]` covers nested
 * repeaters (courses, tests, routes, entries, features, tags…).
 *
 * Pure and dependency-free — safe to import from server and client code.
 */
export function coerceShape<T>(value: unknown, shape: T): T {
  if (Array.isArray(shape)) {
    if (!Array.isArray(value)) return [] as unknown as T; // malformed list → safe empty
    const proto = shape[0];
    if (proto && typeof proto === "object") {
      return value.map((v) => coerceShape(v, proto)) as unknown as T;
    }
    return value as unknown as T;
  }
  if (shape && typeof shape === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value as T;
    const out: Record<string, unknown> = { ...(value as Record<string, unknown>) };
    for (const [k, sub] of Object.entries(shape as Record<string, unknown>)) {
      if (k in out) out[k] = coerceShape(out[k], sub);
    }
    return out as T;
  }
  return value as T;
}

/** Always get an array back, whatever the CMS stored. */
export const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
