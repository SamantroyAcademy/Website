import test from "node:test";
import assert from "node:assert/strict";
import { assess, findEligible, nearMisses, type EligibilityInput } from "./eligibility.ts";
import { lookupStandard, STANDARD_ROWS, margin } from "./standards.ts";

const base: EligibilityInput = {
  age: 19, gender: "male", marital: "unmarried", education: "10th", pcm: false,
  heightCm: 172, chestCm: 82, category: "UR", domicile: "odisha",
};
const slugs = (i: EligibilityInput) => findEligible(i).map((e) => e.slug);

test("a 19-year-old 10th-pass man qualifies for the 10th-level entries", () => {
  const s = slugs(base);
  for (const slug of ["army-agniveer-gd", "ssc-gd-constable", "navy-agniveer-mr", "rrb-group-d", "rpf-constable"]) {
    assert.ok(s.includes(slug), `${slug} should be eligible`);
  }
  assert.ok(!s.includes("navy-agniveer-ssr"), "SSR needs Class 12 science");
  assert.ok(!s.includes("odisha-police-si"), "SI needs graduation");
});

test("height shortfall is reported with the exact gap, as a near miss", () => {
  const short = { ...base, heightCm: 168 };
  const v = assess(short).find((x) => x.exam.slug === "ssc-gd-constable")!;
  assert.equal(v.eligible, false);
  assert.deepEqual(v.reasons, ["2 cm short of the 170 cm height standard"]);
  assert.ok(nearMisses(short).some((x) => x.exam.slug === "ssc-gd-constable"));
});

test("ST relaxation applies: 164 cm clears SSC GD for an ST candidate", () => {
  const st = { ...base, heightCm: 164, chestCm: 78, category: "ST" as const };
  assert.ok(slugs(st).includes("ssc-gd-constable"));
});

test("Odisha-only exams are hidden from other-state candidates", () => {
  const other = { ...base, education: "12th-other" as const, domicile: "other" as const };
  const v = assess(other).find((x) => x.exam.slug === "odisha-police-constable")!;
  assert.ok(v.reasons.includes("Open to Odisha residents only"));
});

test("men-only entries are closed to women, and marriage rules are enforced", () => {
  const woman = { ...base, gender: "female" as const, heightCm: 160 };
  assert.ok(!slugs(woman).includes("army-agniveer-gd"));
  const married = { ...base, marital: "married" as const };
  assert.ok(!slugs(married).includes("army-agniveer-gd"));
  assert.ok(slugs(married).includes("ssc-gd-constable"), "SSC GD has no marriage rule");
});

test("PCM gates science entries, and a diploma counts for Airman X", () => {
  const science = { ...base, education: "12th-science" as const, pcm: true };
  assert.ok(slugs(science).includes("navy-agniveer-ssr"));
  assert.ok(!slugs({ ...science, pcm: false }).includes("navy-agniveer-ssr"));
  assert.ok(slugs({ ...base, education: "iti-diploma" as const }).includes("airforce-agniveervayu-x"));
});

test("standards lookup falls back from category to the base row", () => {
  const sc = lookupStandard(STANDARD_ROWS, "ssc-gd-constable", "male", "SC");
  assert.equal(sc?.height_cm, 170, "SC shares the UR row when no SC row exists");
  const st = lookupStandard(STANDARD_ROWS, "ssc-gd-constable", "male", "ST");
  assert.equal(st?.height_cm, 162.5);
  assert.equal(lookupStandard(STANDARD_ROWS, "no-such-exam", "male", "UR"), null);
});

test("margin is positive above the minimum and negative below", () => {
  assert.equal(margin(172, 170), 2);
  assert.equal(margin(168.4, 170), -1.6);
  assert.equal(margin(null, 170), null);
});
