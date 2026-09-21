import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { CMS_TAG } from "@/lib/content";

/**
 * Keys and tokens for outside services (Google reviews, Instagram, Facebook),
 * pasted by an admin under Admin, Connections.
 *
 * Stored in site_content "integrations", in the DRAFT column only: anonymous
 * visitors can read nothing but the published column (through the
 * published_content view), and drafts are admin-only by row-level security.
 * The published column stays empty. Environment variables work too and act
 * as the fallback, so keys can live in Vercel instead if preferred.
 */
export type Integrations = {
  googleKey: string;
  /** Optional: skips the search for the academy's place. */
  googlePlaceId: string;
  instagramToken: string;
  /** When the Instagram token was saved or last refreshed (ISO). */
  instagramTokenAt: string;
  facebookPageId: string;
  facebookToken: string;
};

const KEY = "integrations";
export const FEEDS_TAG = "feeds";

const EMPTY: Integrations = { googleKey: "", googlePlaceId: "", instagramToken: "", instagramTokenAt: "", facebookPageId: "", facebookToken: "" };

async function readStored(): Promise<Partial<Integrations>> {
  if (!hasServiceRole()) return {};
  const { data } = await createAdminClient().from("site_content").select("draft").eq("key", KEY).maybeSingle();
  return (data?.draft ?? {}) as Partial<Integrations>;
}

/** Stored values, falling back to environment variables. Uncached: for
 *  admin screens and the daily cron. */
export async function readIntegrations(): Promise<Integrations> {
  const s = await readStored().catch(() => ({} as Partial<Integrations>));
  const pick = (v: unknown, env?: string) => (typeof v === "string" && v.trim() ? v.trim() : (env ?? "").trim());
  return {
    googleKey: pick(s.googleKey, process.env.GOOGLE_PLACES_API_KEY),
    googlePlaceId: pick(s.googlePlaceId, process.env.GOOGLE_PLACE_ID),
    instagramToken: pick(s.instagramToken, process.env.INSTAGRAM_ACCESS_TOKEN),
    instagramTokenAt: pick(s.instagramTokenAt),
    facebookPageId: pick(s.facebookPageId, process.env.FACEBOOK_PAGE_ID),
    facebookToken: pick(s.facebookToken, process.env.FACEBOOK_PAGE_TOKEN),
  };
}

/** The same, cached for page renders (refreshed hourly or on any publish). */
export const getIntegrations = unstable_cache(readIntegrations, ["integrations"], { revalidate: 3600, tags: [CMS_TAG, FEEDS_TAG] });

/** Merge a change into the stored values (service role only). */
export async function saveIntegrations(patch: Partial<Integrations>): Promise<void> {
  const current = { ...EMPTY, ...(await readStored()) };
  const next = { ...current, ...patch };
  const { error } = await createAdminClient().from("site_content").upsert(
    { key: KEY, label: "Connections (private)", draft: next, published: {} },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
}

/** "••••1234" for showing that a secret is set without revealing it. */
export const mask = (v: string) => (v ? `••••${v.slice(-4)}` : "");
