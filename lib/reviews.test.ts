import { test } from "node:test";
import assert from "node:assert/strict";
import { incompleteReviews, mergeReviews } from "./reviews.ts";

const r = (name: string, text: string, url = "") => ({ name, text, url, rating: 5 });

test("mergeReviews puts new reviews first and skips ones already listed", () => {
  const { items, added } = mergeReviews([r("Asha", "Great coaching")], [r("Ravi", "Good"), r("asha", "great coaching ")]);
  assert.equal(added, 1);
  assert.deepEqual(items.map((x) => x.name), ["Ravi", "Asha"]);
});

test("mergeReviews ignores reviews with no name or text, and caps the list", () => {
  const many = Array.from({ length: 40 }, (_, i) => r(`P${i}`, "t"));
  assert.equal(mergeReviews([], [r("", "x"), ...many], 30).items.length, 30);
});

test("incompleteReviews flags a card with only a link, not an empty or complete one", () => {
  assert.deepEqual(incompleteReviews([r("", "", "https://maps.app.goo.gl/x"), r("", ""), r("A", "B")]), [1]);
});
