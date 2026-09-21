import { test } from "node:test";
import assert from "node:assert/strict";
import { isGoogleMapsHost, monthYear, parseReviewRpc, reviewIdsFrom, sizedGoogleImage } from "./review-link.ts";

const expanded = "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2xCV1kzZG1XV3hCVmxOU1RXc3lUR0o1VVVwV1lVRRAB!2m1!1s0x0:0x2980bdca1fe41371!3m1!1s2@1:CAIQACodChtycF9oOlBWY3dmWWxBVlNSTWsyTGJ5UUpWYUE%7C%7C?entry=tts";

test("reads the review and place ids from an expanded share link", () => {
  assert.deepEqual(reviewIdsFrom(expanded), {
    reviewId: "Ci9DQUlRQUNvZENodHljRjlvT2xCV1kzZG1XV3hCVmxOU1RXc3lUR0o1VVVwV1lVRRAB",
    placeId: "0x0:0x2980bdca1fe41371",
  });
  // A place link has no review in it.
  assert.equal(reviewIdsFrom("https://www.google.com/maps/place/X/data=!4m6!3m5!1s0x3a3d5aa2c3ee6c09:0x2980bdca1fe41371!8m2"), null);
});

test("allows only Google Maps hosts", () => {
  for (const h of ["maps.app.goo.gl", "www.google.com", "google.co.in", "maps.google.com"]) assert.ok(isGoogleMapsHost(h), h);
  for (const h of ["evil.com", "google.com.evil.com", "localhost", "169.254.169.254"]) assert.ok(!isGoogleMapsHost(h), h);
});

test("parses Google's answer, tolerating gaps", () => {
  const r: unknown[] = [];
  r[1] = [null, null, 1757090118496225, null, [null, null, null, null, null, ["ANIL PATRO", "https://lh3.googleusercontent.com/a-/x=s120-c-rp"]]];
  r[2] = [[5], null, [[null, [null, null, null, null, null, null, ["https://lh3.googleusercontent.com/grass-cs/p1=k-no"]]]]];
  (r[2] as unknown[])[15] = [["Excellent academy"]];
  const body = `)]}'\n${JSON.stringify([1, "x", null, null, null, null, null, r])}`;
  const got = parseReviewRpc(body);
  assert.equal(got?.name, "ANIL PATRO");
  assert.equal(got?.rating, 5);
  assert.equal(got?.text, "Excellent academy");
  assert.deepEqual(got?.photos, ["https://lh3.googleusercontent.com/grass-cs/p1=k-no"]);
  assert.equal(got?.publishedAt.slice(0, 10), "2025-09-05");
  assert.equal(parseReviewRpc("<!DOCTYPE html>"), null);
  assert.equal(parseReviewRpc(`)]}'\n[1]`), null);
});

test("resizes Google images and formats dates", () => {
  assert.equal(sizedGoogleImage("https://lh3.googleusercontent.com/a-/x=s120-c-rp", "s160-c"), "https://lh3.googleusercontent.com/a-/x=s160-c");
  assert.equal(sizedGoogleImage("https://example.com/a.jpg", "s160"), "https://example.com/a.jpg");
  assert.equal(monthYear("2025-09-05T16:35:18Z"), "September 2025");
});
