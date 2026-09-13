/** Configuration for the contact / enquiry form: which fields it has, in what
 *  order, their labels and placeholders, which show (and in the popup), which
 *  are mandatory, and each dropdown's options. Admin, Enquiry Form edits it.
 *
 *  Plain data with no imports, so it is safe to use from both the server
 *  (admin editor, API validation) and the client (the form itself). */

/** The fields the academy's CRM understands. Name and phone can be renamed or
 *  hidden but not deleted; the others can be deleted and added back. */
export const BUILTIN_KEYS = ["name", "phone", "email", "entry", "batch", "status", "message"] as const;
export type ContactFieldKey = (typeof BUILTIN_KEYS)[number];
export const PERMANENT_KEYS: readonly string[] = ["name", "phone"];

/** Built-ins have a fixed type; questions the admin adds pick one of
 *  CUSTOM_TYPES. */
export type FieldType = "text" | "textarea" | "select" | "number" | "phone" | "email";
export const CUSTOM_TYPES: { type: FieldType; label: string }[] = [
  { type: "text", label: "Short answer" },
  { type: "textarea", label: "Paragraph" },
  { type: "select", label: "Dropdown" },
  { type: "number", label: "Number" },
];

export type ContactField = {
  /** A built-in key, or "f_" plus letters and digits for an added question. */
  key: string;
  type: FieldType;
  label: string;
  placeholder: string;
  /** Shown with a red *, and the browser blocks an empty submit. */
  required: boolean;
  /** Off hides the field without deleting its settings. */
  enabled: boolean;
  /** Also shown in the enquiry popup (which must fit one phone screen). */
  popup: boolean;
  /** Dropdown options, in order (dropdowns only). */
  options?: string[];
};

export type ContactFormDoc = {
  /** 2 = fields carry their own order and options. Older documents are read
   *  and converted by resolveContactForm. */
  version: 2;
  fields: ContactField[];
  submitLabel: string;
  successMessage: string;
  privacyNote: string;
};

export const MAX_FIELDS = 20;
export const MAX_OPTIONS = 100;
const CUSTOM_KEY = /^f_[a-z0-9]{4,24}$/;

export const isBuiltin = (key: string): key is ContactFieldKey => (BUILTIN_KEYS as readonly string[]).includes(key);
export const isCustomKey = (key: string) => CUSTOM_KEY.test(key);
export const newFieldKey = () => `f_${Math.random().toString(36).slice(2, 10).padEnd(6, "0")}`;

/** Every exam an aspirant can target: other-rank entries first, officer entries last. */
export const ENTRY_OPTIONS: string[] = [
  "Army Agniveer GD",
  "Army Agniveer Technical",
  "Army Agniveer Clerk / SKT",
  "Army Agniveer Tradesman",
  "Navy Agniveer SSR",
  "Navy Agniveer MR",
  "Air Force X group",
  "Air Force Y group",
  "Coast Guard Navik / Yantrik",
  "SSC GD Constable (CAPF)",
  "SSC CPO (SI)",
  "Odisha Police Constable",
  "Odisha Police SI",
  "Odisha Forest Guard / Forester",
  "Odisha Fire Services",
  "OSSC / OSSSC posts",
  "OPSC (OCS / ASO)",
  "Bank PO",
  "Bank Clerk",
  "RRB Group D",
  "RRB NTPC",
  "RRB ALP / Technician",
  "RPF Constable / SI",
  "SSC MTS / CHSL / CGL",
  "NDA / NA / TES",
  "CDS / AFCAT / NCC",
  "Not sure yet",
];

export const BATCH_OPTIONS: string[] = [
  "Defence: Army, Navy, Air Force",
  "NDA batch, 21 September",
  "CDS batch, 14 October",
  "Police and CAPF",
  "Bank, Railway and SSC",
  "Not sure yet",
];
export const STATUS_OPTIONS: string[] = [
  "Just starting",
  "Applied, written exam next",
  "Written cleared, physical next",
  "Attempted before",
];

/** The built-in fields as they ship. */
export const BUILTIN_FIELDS: Record<ContactFieldKey, ContactField> = {
  name: { key: "name", type: "text", label: "Full name", placeholder: "e.g. Sanjay Behera", required: true, enabled: true, popup: true },
  phone: { key: "phone", type: "phone", label: "Phone", placeholder: "98765 43210", required: true, enabled: true, popup: true },
  email: { key: "email", type: "email", label: "Email", placeholder: "you@example.com", required: false, enabled: true, popup: false },
  entry: { key: "entry", type: "select", label: "Target exam", placeholder: "Select your exam", required: true, enabled: true, popup: true, options: ENTRY_OPTIONS },
  batch: { key: "batch", type: "select", label: "Preferred batch", placeholder: "Select a batch", required: false, enabled: true, popup: true, options: BATCH_OPTIONS },
  status: { key: "status", type: "select", label: "Where you are now", placeholder: "Select one", required: false, enabled: true, popup: false, options: STATUS_OPTIONS },
  message: { key: "message", type: "textarea", label: "Message", placeholder: "Your height, category, or any question", required: false, enabled: true, popup: false },
};

export const CONTACT_FORM: ContactFormDoc = {
  version: 2,
  fields: BUILTIN_KEYS.map((k) => BUILTIN_FIELDS[k]),
  submitLabel: "Request a callback",
  successMessage: "Thank you. Samantroy Academy will call you back within one working day.",
  privacyNote: "Your details stay with Samantroy Academy. We never share them.",
};

/* ── Reading a saved document ─────────────────────────────────────────── */

type Raw = Record<string, unknown>;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Trimmed, de-duplicated, non-empty options, capped. */
export function cleanOptions(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const o of v) {
    const s = str(o, 120);
    if (s && !seen.has(s.toLowerCase())) { seen.add(s.toLowerCase()); out.push(s); }
    if (out.length >= MAX_OPTIONS) break;
  }
  return out;
}

/** One field from storage, made safe. Unknown keys are dropped (null). */
function cleanField(raw: Raw, legacyOptions?: unknown): ContactField | null {
  const key = typeof raw.key === "string" ? raw.key : "";
  const def = isBuiltin(key) ? BUILTIN_FIELDS[key] : null;
  if (!def && !isCustomKey(key)) return null;
  const type: FieldType = def ? def.type : CUSTOM_TYPES.some((t) => t.type === raw.type) ? (raw.type as FieldType) : "text";
  const field: ContactField = {
    key,
    type,
    label: str(raw.label, 80) || def?.label || "Untitled question",
    placeholder: typeof raw.placeholder === "string" ? raw.placeholder.slice(0, 120) : def?.placeholder ?? "",
    required: typeof raw.required === "boolean" ? raw.required : def?.required ?? false,
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : def?.enabled ?? true,
    popup: typeof raw.popup === "boolean" ? raw.popup : def?.popup ?? false,
  };
  if (type === "select") {
    const opts = cleanOptions(raw.options ?? legacyOptions);
    // A built-in dropdown never ends up empty; an added one may (the editor warns).
    field.options = opts.length || !def ? opts : [...(def.options ?? [])];
  }
  return field;
}

/** Any stored document (current, older, partial or empty) as a complete,
 *  valid form. Version 2 keeps the admin's order, deletions and added
 *  questions; older documents keep their settings and move each dropdown's
 *  options onto its field. Name and phone are always present. */
export function resolveContactForm(saved: unknown): ContactFormDoc {
  const doc = (saved && typeof saved === "object" ? saved : {}) as Raw;
  const savedFields = Array.isArray(doc.fields) ? (doc.fields as unknown[]).filter((f): f is Raw => !!f && typeof f === "object") : [];
  const legacy: Record<string, unknown> = { entry: doc.entryOptions, batch: doc.batchOptions, status: doc.statusOptions };

  let fields: ContactField[];
  if (doc.version === 2) {
    fields = [];
    const seen = new Set<string>();
    for (const raw of savedFields) {
      const f = cleanField(raw);
      if (f && !seen.has(f.key) && fields.length < MAX_FIELDS) { seen.add(f.key); fields.push(f); }
    }
    // Name and phone cannot be deleted: put back any that went missing.
    for (const k of [...PERMANENT_KEYS].reverse()) {
      if (!seen.has(k)) fields.unshift({ ...BUILTIN_FIELDS[k as ContactFieldKey] });
    }
  } else {
    // Older documents: every built-in, in the built-in order, with the saved settings.
    fields = BUILTIN_KEYS.map((k) => {
      const hit = savedFields.find((f) => f.key === k);
      return hit ? cleanField(hit, legacy[k])! : cleanField({ ...BUILTIN_FIELDS[k], options: legacy[k] ?? BUILTIN_FIELDS[k].options })!;
    });
  }

  const text = (v: unknown, fallback: string) => str(v, 300) || fallback;
  return {
    version: 2,
    fields,
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
