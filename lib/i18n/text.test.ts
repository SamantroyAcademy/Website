import { test } from "node:test";
import assert from "node:assert/strict";
import { hasOdia, norm, worthTranslating } from "./text.ts";

test("norm collapses whitespace", () => {
  assert.equal(norm("  Book  free\n counselling "), "Book free counselling");
});

test("real sentences and labels are translated", () => {
  for (const s of ["Book free counselling", "Which exams can I apply for?", "Navy SSR"]) assert.equal(worthTranslating(s), true, s);
});

test("numbers, phones, links and emails are not", () => {
  for (const s of ["+91 98610 77371", "2001", "https://www.samantroyacademy.com", "www.example.com", "info@samantroyacademy.com", "4000+", "a", ""]) {
    assert.equal(worthTranslating(s), false, s);
  }
});

test("hasOdia detects Odia script", () => {
  assert.equal(hasOdia("ଭର୍ତ୍ତି ଚାଲିଛି"), true);
  assert.equal(hasOdia("Admissions are on"), false);
});
