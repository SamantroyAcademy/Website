import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanTitle, SHORTS_DOC } from "./shorts.ts";

test("cleanTitle drops hashtags, handles, emoji and trailing dividers", () => {
  assert.equal(cleanTitle("Airforce final Result 2026 || #viralreels #viralreels #motivation"), "Airforce final Result 2026");
  assert.equal(cleanTitle("Who Built The Kailashanath Temple At Ellora?@prasantanayakmotivation1873"), "Who Built The Kailashanath Temple At Ellora?");
  assert.equal(cleanTitle("Airforce medical assistant final result 2026 || Congratulations 🎉 Ashirbad Sahu"), "Airforce medical assistant final result 2026: Congratulations Ashirbad Sahu");
  assert.equal(cleanTitle("SAMANTROY ACADEMY SINCE 2001 || NDA VST-2 || #viralreels #army"), "SAMANTROY ACADEMY SINCE 2001: NDA VST-2");
});

test("default shorts are unique and point at YouTube", () => {
  const ids = SHORTS_DOC.items.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const s of SHORTS_DOC.items) assert.match(s.url, /^https:\/\/www\.youtube\.com\/shorts\/[\w-]{11}$/);
});
