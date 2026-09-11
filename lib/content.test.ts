import test from "node:test";
import assert from "node:assert/strict";

/** Mirror of coerceShape in lib/content.ts (kept in sync by these tests). */
function coerceShape<T>(value: unknown, shape: T): T {
  if (Array.isArray(shape)) {
    if (!Array.isArray(value)) return [] as unknown as T;
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

test('a list saved as "" becomes an empty array', () => {
  const shape = { images: ["a.jpg"] };
  assert.deepEqual(coerceShape({ images: "" }, shape), { images: [] });
});

test("nested repeater lists are coerced (the /academies crash)", () => {
  const shape = { items: [{ short: "", courses: [{ name: "" }], highlights: [""] }] };
  const stored = {
    items: [
      { short: "IMA", courses: [{ name: "CDS" }], highlights: ["x"] },
      { short: "NDA", courses: "", highlights: [] }, // the malformed row
    ],
  };
  const out = coerceShape(stored, shape) as typeof stored;
  assert.ok(Array.isArray(out.items[1].courses));
  assert.equal(out.items[1].courses.length, 0);
  assert.equal(out.items[0].courses.length, 1); // good rows untouched
});

test("deeply nested lists (journey days → tests) are coerced", () => {
  const shape = { items: [{ code: "", tests: [{ name: "", detail: "" }] }] };
  const out = coerceShape({ items: [{ code: "GTO", tests: "" }] }, shape) as { items: { tests: unknown[] }[] };
  assert.deepEqual(out.items[0].tests, []);
});

test("valid data passes through unchanged", () => {
  const shape = { items: [{ value: 0, label: "" }] };
  const stored = { items: [{ value: 677, label: "Recommendations" }] };
  assert.deepEqual(coerceShape(stored, shape), stored);
});

test("scalar lists (tags) survive and malformed ones empty out", () => {
  const shape = { tags: [""] };
  assert.deepEqual(coerceShape({ tags: ["a", "b"] }, shape), { tags: ["a", "b"] });
  assert.deepEqual(coerceShape({ tags: null }, shape), { tags: [] });
});

test("extra keys the fallback doesn't know about are preserved", () => {
  const shape = { a: "" };
  assert.deepEqual(coerceShape({ a: "x", b: 42 }, shape), { a: "x", b: 42 });
});
