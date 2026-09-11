import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SITE } from "@/lib/data";
import { mediaUrl } from "@/lib/supabase/media";
import { sanitizeHtml } from "@/lib/sanitize";
import { coerceShape } from "@/lib/shape";

/** How long published CMS reads are cached (seconds). Admin edits appear within
 *  this window; publishing also busts the cache immediately via revalidateTag. */
export const CMS_REVALIDATE = 300;
export const CMS_TAG = "cms";

/** Recursively sanitize every string in a CMS payload. Rich-text fields are
 *  rendered with dangerouslySetInnerHTML downstream, so we neutralize any
 *  script/event-handler injection here, once, for all consumers. */
function deepSanitize<T>(value: T): T {
  if (typeof value === "string") return sanitizeHtml(value) as unknown as T;
  if (Array.isArray(value)) return value.map(deepSanitize) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = deepSanitize(v);
    return out as T;
  }
  return value;
}

/** True when an authenticated admin is previewing drafts (cookie set by the editor). */
async function isPreview(): Promise<boolean> {
  try {
    const c = await cookies();
    return c.get("sa-preview")?.value === "1";
  } catch {
    return false;
  }
}

export type SiteSettings = typeof SITE;

/** Site-wide settings (contact, socials, footer), CMS-overridable with defaults. */
export async function getSettings(): Promise<SiteSettings> {
  return getPublished<SiteSettings>("settings", SITE);
}

/** tel: href from a display phone number. */
export const telHref = (p: string) => `tel:${(p || "").replace(/[^\d+]/g, "")}`;

/** Is the brochure available to download? */
export const brochureOn = (s: { brochureEnabled?: string }) => s.brochureEnabled !== "off";

/** Where a "download the brochure" link should point. With downloads switched
 *  off the academy would rather talk first, so it goes to the contact form. */
export const brochureHref = (s: { brochureEnabled?: string; brochure?: string }) =>
  brochureOn(s) ? mediaUrl(s.brochure ?? "") : "/contact";

/** Google Maps link for the academy. Falls back to a search on the address
 *  itself so the link still works if the admin clears the map URL. */
export const mapHref = (s: { mapUrl?: string; address?: string }) =>
  s.mapUrl?.trim() || `https://maps.google.com/maps?q=${encodeURIComponent(s.address ?? "")}`;

/** Embed URL for the inline map. Pulls the @lat,lng out of the Maps link so the
 *  pin sits exactly where the admin dropped it; falls back to the address when
 *  the link has no coordinates. */
export function mapEmbedSrc(s: { mapUrl?: string; address?: string }): string {
  const at = (s.mapUrl ?? "").match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const q = at ? `${at[1]},${at[2]}` : s.address ?? "";
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=17&output=embed`;
}

/**
 * Content layer with graceful fallback.
 *
 * `getPublished(key, fallback)` returns the PUBLISHED document for a section
 * from Supabase, or the provided `fallback` (the built-in defaults in
 * lib/data.ts) when Supabase isn't configured or the row doesn't exist yet.
 *
 * This lets the public site keep working before the CMS is populated.
 */
/** Cached fetch of one published doc. Uses the cookie-free public client so the
 *  result can be cached across requests — a page renders ~16 sections, and
 *  without this every one of them is a separate Supabase round trip per visit. */
const fetchPublishedDoc = unstable_cache(
  async (key: string): Promise<Record<string, unknown> | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("published_content")
      .select("published")
      .eq("key", key)
      .maybeSingle();
    if (error || !data?.published) return null;
    return data.published as Record<string, unknown>;
  },
  ["cms-doc"],
  { revalidate: CMS_REVALIDATE, tags: [CMS_TAG] },
);

export async function getPublished<T>(key: string, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    // Preview: an authenticated admin sees the DRAFT (RLS on site_content
    // restricts this to admins; everyone else silently gets published).
    // Never cached — it is per-admin and must reflect edits immediately.
    if (await isPreview()) {
      const supabase = await createClient();
      const { data: draftRow } = await supabase
        .from("site_content")
        .select("draft")
        .eq("key", key)
        .maybeSingle();
      if (draftRow?.draft && Object.keys(draftRow.draft).length > 0) {
        return deepSanitize(coerceShape({ ...fallback, ...(draftRow.draft as Partial<T>) }, fallback)) as T;
      }
    }

    const published = await fetchPublishedDoc(key);
    if (!published || Object.keys(published).length === 0) return fallback;
    return deepSanitize(coerceShape({ ...fallback, ...(published as Partial<T>) }, fallback)) as T;
  } catch {
    return fallback;
  }
}

/** Fetch a published collection view (e.g. 'published_selected_candidates'), else fallback.
 *  Pass `{ limit }` to fetch only what's rendered (e.g. the homepage wall) instead
 *  of pulling the whole table. */
const fetchCollection = unstable_cache(
  async (
    view: string,
    columns: string,
    limit: number | undefined,
    orders: { column: string; ascending?: boolean; nullsFirst?: boolean }[],
  ): Promise<unknown[] | null> => {
    const supabase = createPublicClient();
    let query = supabase.from(view).select(columns);
    for (const o of orders) {
      query = query.order(o.column, { ascending: o.ascending ?? true, nullsFirst: o.nullsFirst ?? false });
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error || !data) return null;
    return data;
  },
  ["cms-collection"],
  { revalidate: CMS_REVALIDATE, tags: [CMS_TAG] },
);

export async function getCollection<T>(
  view: string,
  fallback: T[],
  opts?: {
    limit?: number;
    order?: { column: string; ascending?: boolean; nullsFirst?: boolean }[];
    /** Only fetch the columns actually rendered — smaller payload, less egress. */
    columns?: string;
  },
): Promise<T[]> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    const orders = opts?.order ?? [{ column: "sort_order", ascending: true }];
    const data = await fetchCollection(view, opts?.columns ?? "*", opts?.limit, orders);
    if (!data || data.length === 0) return fallback;
    return deepSanitize(data) as T[];
  } catch {
    return fallback;
  }
}
