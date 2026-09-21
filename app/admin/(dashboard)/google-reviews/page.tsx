import { createClient } from "@/lib/supabase/server";
import { GOOGLE_PLACE_URL, type GoogleReview } from "@/lib/homepage-defaults";
import { asArray } from "@/lib/shape";
import GoogleReviewsManager from "@/components/admin/GoogleReviewsManager";
import { readIntegrations } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export default async function GoogleReviewsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", "google_reviews").maybeSingle();
  const draft = (data?.draft ?? {}) as { items?: GoogleReview[]; placeUrl?: string };
  const { googleKey } = await readIntegrations();
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Google Reviews</h1>
      <p className="mt-1 text-sm text-slate-500">
        Reviews shown on the homepage. Paste a review&apos;s Google link and it is fetched and published.
      </p>
      <GoogleReviewsManager
        initial={asArray<GoogleReview>(draft.items)}
        placeUrl={draft.placeUrl || GOOGLE_PLACE_URL}
        hasKey={Boolean(googleKey)}
      />
    </div>
  );
}
