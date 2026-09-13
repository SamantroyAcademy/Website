import { test } from "node:test";
import assert from "node:assert/strict";
import { popupBatches, type CountdownItem } from "./countdown-defaults.ts";

// 13 September 2026, 10:00 in India.
const NOW = new Date("2026-09-13T10:00:00+05:30").getTime();
const items: CountdownItem[] = [
  { label: "CDS batch", date: "2026-10-14", kind: "batch" },
  { label: "NDA batch", date: "2026-09-21", kind: "batch" },
  { label: "Old exam", date: "2026-09-01", kind: "exam" },
  { label: "Running batch", date: "2026-09-01", kind: "batch" },
  { label: "Stale batch", date: "2026-06-01", kind: "batch" },
  { label: "Today batch", date: "2026-09-13", kind: "batch" },
  { label: "", date: "2026-09-30", kind: "batch" },
];

test("lists recent and upcoming dates in date order", () => {
  const out = popupBatches(items, NOW);
  assert.deepEqual(out.map((b) => b.label), ["Running batch", "Today batch", "NDA batch", "CDS batch"]);
});

test("counts whole days in India time", () => {
  const out = popupBatches(items, NOW);
  assert.equal(out.find((b) => b.label === "NDA batch")?.days, 8);
  assert.equal(out.find((b) => b.label === "Today batch")?.days, 0);
  assert.equal(out.find((b) => b.label === "Today batch")?.status, "upcoming");
  assert.equal(out.find((b) => b.label === "Running batch")?.status, "current");
});

test("drops past exams, stale batches and incomplete rows; caps the list", () => {
  const labels = popupBatches(items, NOW).map((b) => b.label);
  for (const gone of ["Old exam", "Stale batch", ""]) assert.equal(labels.includes(gone), false, gone);
  assert.equal(popupBatches(items, NOW, 45, 2).length, 2);
});

test("late evening UTC still counts the India date", () => {
  // 20:00 UTC on 20 September is 01:30 on 21 September in India: NDA starts today.
  const late = new Date("2026-09-20T20:00:00Z").getTime();
  assert.equal(popupBatches(items, late).find((b) => b.label === "NDA batch")?.days, 0);
});
