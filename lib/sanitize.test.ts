import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeHtml } from "./sanitize.ts";

test("empty/nullish input → empty string", () => {
  assert.equal(sanitizeHtml(""), "");
  assert.equal(sanitizeHtml(null), "");
  assert.equal(sanitizeHtml(undefined), "");
});

test("strips <script> and its contents", () => {
  const out = sanitizeHtml("<b>Hi</b><script>alert(1)</script>");
  assert.ok(out.includes("<b>Hi</b>"));
  assert.ok(!/script/i.test(out));
  assert.ok(!out.includes("alert(1)"));
});

test("strips inline event handlers (onerror)", () => {
  const out = sanitizeHtml('<img src=x onerror="alert(1)">');
  assert.ok(!/onerror/i.test(out));
  assert.ok(!/alert/i.test(out));
});

test("strips solidus-separated event handler <a/onclick=…>", () => {
  const out = sanitizeHtml('<a/onclick="alert(1)">click</a>');
  assert.ok(!/onclick/i.test(out));
  assert.ok(!/alert/i.test(out));
});

test("drops javascript: URLs on links", () => {
  const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
  assert.ok(!/javascript:/i.test(out));
});

test("drops entity-encoded javascript scheme (java&#115;cript:)", () => {
  const out = sanitizeHtml('<a href="java&#115;cript:alert(1)">x</a>');
  assert.ok(!/javascript:/i.test(out.toLowerCase().replace(/&#\d+;/g, "")));
  assert.ok(!/alert/i.test(out));
});

test("removes iframes and other embedded tags", () => {
  const out = sanitizeHtml('<iframe src="//evil"></iframe>ok');
  assert.ok(!/iframe/i.test(out));
  assert.ok(out.includes("ok"));
});

test("survives malformed HTML without leaking script", () => {
  const out = sanitizeHtml('<div><span>unclosed <script>alert(1)</span>');
  assert.ok(!/script/i.test(out));
  assert.ok(!/alert/i.test(out));
});

test("preserves allowed formatting, classes and inline colour", () => {
  const html = '<span class="wa-gold" style="color:red">Word Art</span>';
  const out = sanitizeHtml(html);
  assert.ok(out.includes("wa-gold"));
  assert.ok(/color/.test(out));
  assert.ok(out.includes("Word Art"));
});

test("keeps safe links and hardens target=_blank", () => {
  const out = sanitizeHtml('<a href="https://samantroyacademy.com" target="_blank">site</a>');
  assert.ok(out.includes("https://samantroyacademy.com"));
  assert.ok(/rel="[^"]*noopener[^"]*"/.test(out));
});

test("bare & survives for plain-text rendering (no &amp;)", () => {
  assert.equal(sanitizeHtml("Discipline, Dedication & Determination"), "Discipline, Dedication & Determination");
  assert.equal(sanitizeHtml("A & B <strong>x</strong>"), "A & B <strong>x</strong>");
});

test("real entities are preserved, script still stripped", () => {
  // A genuine entity must not be mangled into a raw character.
  assert.equal(sanitizeHtml("5 &lt; 10"), "5 &lt; 10");
  // An escaped entity stays escaped — it must never become a live <b> tag.
  assert.equal(sanitizeHtml("&amp;lt;b&amp;gt;"), "&amp;lt;b&amp;gt;");
  assert.ok(!/script/i.test(sanitizeHtml("a & b <script>alert(1)</script>")));
});
