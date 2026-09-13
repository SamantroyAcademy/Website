import test from "node:test";
import assert from "node:assert/strict";
import { fullPhone, isValidPhone, phoneDigits, resolveContactForm, CONTACT_FORM } from "./form-defaults.ts";

test("a plain 10-digit number is kept as typed", () => {
  assert.equal(phoneDigits("9876543210"), "9876543210");
});

test("the country code is stripped when a visitor pastes it back in", () => {
  // The field already shows "+91", so every one of these must reduce to the
  // same 10 digits rather than being rejected as too long.
  for (const raw of [
    "+91 98765 43210",
    "+919876543210",
    "91-98765-43210",
    "(+91) 9876543210",
    "091 9876543210",
    "0091 9876543210",
  ]) {
    assert.equal(phoneDigits(raw), "9876543210", `failed for ${raw}`);
  }
});

test("a leading zero from landline habits is dropped", () => {
  assert.equal(phoneDigits("09876543210"), "9876543210");
});

test("a genuine number beginning 91 is not mistaken for a country code", () => {
  assert.equal(phoneDigits("9176543210"), "9176543210");
  assert.equal(phoneDigits("9198765432"), "9198765432");
});

test("letters, spaces and punctuation are ignored", () => {
  assert.equal(phoneDigits("98765-43210"), "9876543210");
  assert.equal(phoneDigits("ph: 98765 43210"), "9876543210");
  assert.equal(phoneDigits(""), "");
});

test("overlong input is capped rather than accepted", () => {
  assert.equal(phoneDigits("98765432109999").length, 10);
});

test("only real Indian mobile numbers validate", () => {
  for (const ok of ["9876543210", "6000000000", "7123456789", "8999999999"]) {
    assert.ok(isValidPhone(ok), `${ok} should be valid`);
  }
  for (const bad of ["1234567890", "5876543210", "987654321", "98765432101", "", "0987654321"]) {
    assert.ok(!isValidPhone(bad), `${bad} should be rejected`);
  }
});

test("storage always carries the dial code, and blank stays blank", () => {
  assert.equal(fullPhone("9876543210"), "+919876543210");
  assert.equal(fullPhone(""), "");
});

test("typing and pasting reach the same stored value", () => {
  assert.equal(fullPhone(phoneDigits("+91 98765 43210")), fullPhone(phoneDigits("9876543210")));
});

test("a saved form document keeps its own settings but gains new fields", () => {
  const saved = { fields: [{ key: "email", label: "E-mail", placeholder: "", required: false, enabled: false }] };
  const doc = resolveContactForm(saved);
  const email = doc.fields.find((f) => f.key === "email");
  assert.equal(email?.enabled, false, "the admin's choice to hide email is honoured");
  assert.equal(email?.label, "E-mail");
  // Fields the saved doc never mentioned fall back to the defaults.
  assert.equal(doc.fields.length, CONTACT_FORM.fields.length);
  assert.equal(doc.fields.find((f) => f.key === "phone")?.enabled, true);
});

test("older documents move each dropdown's options onto its field", () => {
  const doc = resolveContactForm({ entryOptions: ["NDA", "CDS", "NDA", " "], batchOptions: [] });
  assert.equal(doc.version, 2);
  assert.deepEqual(doc.fields.find((f) => f.key === "entry")?.options, ["NDA", "CDS"]);
  // An empty saved list falls back to the defaults rather than an empty dropdown.
  assert.ok((doc.fields.find((f) => f.key === "batch")?.options?.length ?? 0) > 0);
});

test("version 2 keeps the admin's order, deletions and added questions", () => {
  const doc = resolveContactForm({
    version: 2,
    fields: [
      { key: "phone", label: "Mobile", required: true, enabled: true, popup: true },
      { key: "f_city01", type: "select", label: "Your district", options: ["Ganjam", "Puri", "Ganjam"], required: true, enabled: true, popup: false },
      { key: "name", label: "Name", required: true, enabled: true, popup: true },
      { key: "f_height", type: "number", label: "Height (cm)", required: false, enabled: true, popup: false },
    ],
  });
  assert.deepEqual(doc.fields.map((f) => f.key), ["phone", "f_city01", "name", "f_height"]);
  assert.equal(doc.fields.some((f) => f.key === "email"), false, "a deleted field stays deleted");
  assert.deepEqual(doc.fields[1].options, ["Ganjam", "Puri"]);
  assert.equal(doc.fields[3].type, "number");
});

test("name and phone can never be deleted", () => {
  const doc = resolveContactForm({ version: 2, fields: [{ key: "email", label: "Email" }] });
  assert.deepEqual(doc.fields.map((f) => f.key), ["name", "phone", "email"]);
});

test("junk is dropped: unknown keys, duplicate keys, bad types; built-in types are fixed", () => {
  const doc = resolveContactForm({
    version: 2,
    fields: [
      { key: "name" }, { key: "phone" },
      { key: "<script>", label: "x" },
      { key: "f_abcd12", type: "html", label: "Odd" },
      { key: "f_abcd12", type: "text", label: "Duplicate" },
      { key: "email", type: "select", label: "Email" },
      null, "nope",
    ],
  });
  assert.deepEqual(doc.fields.map((f) => f.key), ["name", "phone", "f_abcd12", "email"]);
  assert.equal(doc.fields[2].type, "text");
  assert.equal(doc.fields[2].label, "Odd");
  assert.equal(doc.fields[3].type, "email");
});

test("a dropdown the admin added may be empty; a built-in one never is", () => {
  const doc = resolveContactForm({ version: 2, fields: [{ key: "entry", options: [] }, { key: "f_empty1", type: "select", label: "Q", options: [] }] });
  assert.ok((doc.fields.find((f) => f.key === "entry")?.options?.length ?? 0) > 0);
  assert.deepEqual(doc.fields.find((f) => f.key === "f_empty1")?.options, []);
});

test("the field count is capped", () => {
  const many = Array.from({ length: 40 }, (_, i) => ({ key: `f_q${String(i).padStart(4, "0")}`, type: "text", label: `Q${i}` }));
  assert.ok(resolveContactForm({ version: 2, fields: many }).fields.length <= 22);
});
