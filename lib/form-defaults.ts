/** Configuration for the contact / enquiry form — labels, placeholders, which
 *  fields show, which are mandatory, and the dropdown option lists.
 *
 *  Plain data with no imports, so it is safe to use from both the server
 *  (admin editor, API validation) and the client (the form itself). */

export type ContactFieldKey =
  | "name"
  | "phone"
  | "email"
  | "entry"
  | "batch"
  | "status"
  | "message";

export type ContactField = {
  key: ContactFieldKey;
  label: string;
  placeholder: string;
  /** "on" → shown with a red *, and the browser blocks an empty submit. */
  required: boolean;
  /** "off" hides the field entirely without deleting its settings. */
  enabled: boolean;
};

export type ContactFormDoc = {
  fields: ContactField[];
  /** Options for the three dropdowns. */
  entryOptions: string[];
  batchOptions: string[];
  statusOptions: string[];
  submitLabel: string;
  successMessage: string;
  privacyNote: string;
};

/** Every exam an aspirant can target: other-rank entries first, officer entries last. */
export const ENTRY_OPTIONS: string[] = [
  "Army Agniveer GD",
  "Army Agniveer Technical",
  "Army Agniveer Clerk / SKT",
  "Army Agniveer Tradesman",
  "Navy Agniveer SSR",
  "Navy Agniveer MR",
  "Air Force Agniveervayu (X group)",
  "Air Force Agniveervayu (Y group)",
  "Coast Guard Navik / Yantrik",
  "SSC GD Constable (CAPF)",
  "SSC CPO (SI)",
  "Odisha Police Constable",
  "Odisha Police SI",
  "Odisha Forest Guard / Forester",
  "Odisha Fire Services",
  "OSSSC / OSSC posts",
  "RRB Group D",
  "RRB NTPC",
  "RRB ALP / Technician",
  "RPF Constable / SI",
  "SSC MTS / CHSL / CGL",
  "NDA / CDS / AFCAT",
  "Not sure yet",
];

export const BATCH_OPTIONS: string[] = [
  "Complete Selection (written + physical)",
  "Written only",
  "Physical training only",
  "Online live batch",
];
export const STATUS_OPTIONS: string[] = [
  "Preparing, no notification yet",
  "Applied, written exam coming up",
  "Cleared written, physical test next",
  "Attempted before",
];

export const CONTACT_FORM: ContactFormDoc = {
  fields: [
    { key: "name", label: "Full name", placeholder: "e.g. Sanjay Behera", required: true, enabled: true },
    { key: "phone", label: "Phone", placeholder: "98765 43210", required: true, enabled: true },
    { key: "email", label: "Email", placeholder: "you@example.com", required: false, enabled: true },
    { key: "entry", label: "Target exam", placeholder: "Select your exam", required: true, enabled: true },
    { key: "batch", label: "Preferred batch", placeholder: "Select a batch", required: false, enabled: true },
    { key: "status", label: "Where you are now", placeholder: "Select one", required: false, enabled: true },
    { key: "message", label: "Message", placeholder: "Your height, category, or any question", required: false, enabled: true },
  ],
  entryOptions: ENTRY_OPTIONS,
  batchOptions: BATCH_OPTIONS,
  statusOptions: STATUS_OPTIONS,
  submitLabel: "Request a callback",
  successMessage: "Thank you. A trainer will call you back within one working day.",
  privacyNote: "Your details stay with Samantroy Academy. We never share them.",
};

/** Merge a stored document over the defaults so a partially-filled CMS doc (or
 *  one saved before a field existed) still renders a complete form. */
export function resolveContactForm(saved: unknown): ContactFormDoc {
  const doc = (saved ?? {}) as Partial<ContactFormDoc>;
  const savedFields = Array.isArray(doc.fields) ? doc.fields : [];

  const fields = CONTACT_FORM.fields.map((def) => {
    const hit = savedFields.find((f) => f && f.key === def.key);
    if (!hit) return def;
    return {
      key: def.key,
      label: typeof hit.label === "string" && hit.label.trim() ? hit.label : def.label,
      placeholder: typeof hit.placeholder === "string" ? hit.placeholder : def.placeholder,
      required: typeof hit.required === "boolean" ? hit.required : def.required,
      enabled: typeof hit.enabled === "boolean" ? hit.enabled : def.enabled,
    };
  });

  const list = (v: unknown, fallback: string[]) => {
    const arr = Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];
    return arr.length ? arr : fallback;
  };
  const text = (v: unknown, fallback: string) =>
    typeof v === "string" && v.trim() ? v : fallback;

  return {
    fields,
    entryOptions: list(doc.entryOptions, CONTACT_FORM.entryOptions),
    batchOptions: list(doc.batchOptions, CONTACT_FORM.batchOptions),
    statusOptions: list(doc.statusOptions, CONTACT_FORM.statusOptions),
    submitLabel: text(doc.submitLabel, CONTACT_FORM.submitLabel),
    successMessage: text(doc.successMessage, CONTACT_FORM.successMessage),
    privacyNote: text(doc.privacyNote, CONTACT_FORM.privacyNote),
  };
}

/* ── Phone handling ───────────────────────────────────────────────────────
   The academy serves Indian aspirants, so the dial code is fixed and shown
   as a prefix rather than typed. Visitors enter the 10 national digits only;
   everything stored, emailed and validated uses the full +91 form. */

export const PHONE_DIAL_CODE = "+91";

/**
 * Reduce anything typed or pasted to at most 10 national digits.
 * Tolerates the formats people actually paste — "+91 98765 43210",
 * "091-98765-43210", "(+91) 9876543210" — so a paste is never rejected for
 * repeating the country code the field already shows.
 */
export function phoneDigits(raw: string): string {
  let d = (raw ?? "").replace(/\D/g, "");
  d = d.replace(/^0+/, "");
  // Only strip a leading 91 when digits remain beyond a full local number,
  // so a genuine number starting "91…" is left alone.
  if (d.startsWith("91") && d.length > 10) d = d.slice(2);
  return d.slice(0, 10);
}

/** Indian mobile numbers are exactly 10 digits and begin 6, 7, 8 or 9. */
export const isValidPhone = (digits: string): boolean => /^[6-9]\d{9}$/.test(digits);

/** The form the number is stored and emailed in. */
export const fullPhone = (digits: string): string =>
  digits ? `${PHONE_DIAL_CODE}${digits}` : "";
