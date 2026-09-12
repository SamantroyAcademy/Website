/** Icon registry for CMS-editable cards.
 *
 *  Cards store an icon KEY (not an emoji) so
 *  every card renders a consistent Phosphor glyph (see components/Icon.tsx).
 *  Plain data, safe for server and client: the admin editor uses ICON_OPTIONS
 *  as its dropdown, and the public site maps the key to a component.
 *
 *  Unknown keys (including emoji saved before this change) fall back to the
 *  default glyph, so old content never breaks a render. */

export const ICON_KEYS = [
  "target", "medal", "compass", "users", "shield", "scales", "run", "barbell",
  "book", "exam", "clipboard", "heartbeat", "ruler", "train", "anchor", "plane",
  "police", "star", "flag", "map", "handshake", "graduation", "certificate",
  "timer", "lightning", "sunrise", "strategy", "megaphone", "calendar",
  "stethoscope", "eye", "document", "id-card", "checklist", "trophy",
  "military-medal", "crosshair", "siren", "tree", "fire", "buildings",
  "student", "teacher", "lifebuoy", "mountains", "calculator", "brain",
  "translate", "globe", "newspaper", "chart", "footprints", "fist", "bed",
  "food", "books", "pencil", "gauge", "hourglass", "wrench", "seal",
] as const;

export type IconKey = (typeof ICON_KEYS)[number];

const LABELS: Partial<Record<IconKey, string>> = {
  run: "Running",
  plane: "Aircraft",
  police: "Police",
  "id-card": "ID card",
  "military-medal": "Military medal",
  users: "Group",
  shield: "Shield",
  seal: "Verified seal",
  fist: "Strength",
};

const titleCase = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const ICON_OPTIONS = ICON_KEYS.map((k) => ({ value: k, label: LABELS[k] ?? titleCase(k) }));

export const isIconKey = (v: unknown): v is IconKey =>
  typeof v === "string" && (ICON_KEYS as readonly string[]).includes(v);
