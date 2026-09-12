import { test } from "node:test";
import assert from "node:assert/strict";
import { checkUpload, isValidFolder, isValidKey } from "./r2-keys.ts";

test("accepts the keys the admin uploaders build", () => {
  for (const k of ["candidates/1718000000000-sanjay-behera.webp", "campus-gallery/1718-ab12c.webp", "resources/1718-Syllabus_2026.pdf", "brochure/1718-brochure.pdf"]) {
    assert.equal(isValidKey(k), true, k);
  }
});

test("rejects traversal, nesting, root files and odd characters", () => {
  for (const k of ["../secret", "a/../b", "candidates/../../x.png", "images/forces/army.jpg", "file.png", "/candidates/x.png", "Candidates/x.png", "candidates/x y.png", "candidates/.env", "", 42]) {
    assert.equal(isValidKey(k), false, String(k));
  }
});

test("folders are single lowercase segments", () => {
  assert.equal(isValidFolder("library"), true);
  assert.equal(isValidFolder("campus-gallery"), true);
  assert.equal(isValidFolder("images/forces"), false);
  assert.equal(isValidFolder(null), false);
});

test("only allowed types, within size limits", () => {
  assert.equal(checkUpload("library/1-a.webp", "image/webp", 2_000_000), null);
  assert.equal(checkUpload("resources/1-a.pdf", "application/pdf", 20 * 1024 * 1024), null);
  assert.match(checkUpload("library/1-a.svg", "image/svg+xml", 100) ?? "", /Only/);
  assert.match(checkUpload("library/1-a.html", "text/html", 100) ?? "", /Only/);
  assert.match(checkUpload("library/1-a.webp", "image/webp", 11 * 1024 * 1024) ?? "", /too large/);
  assert.match(checkUpload("library/1-a.webp", "image/webp", 0) ?? "", /Empty/);
  assert.match(checkUpload("library/1-a.webp", "image/webp", 1.5) ?? "", /Empty/);
});
