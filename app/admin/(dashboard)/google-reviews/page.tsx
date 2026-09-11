import { createClient } from "@/lib/supabase/server";
import { GOOGLE_PLACE_URL, type GoogleReview } from "@/lib/homepage-defaults";
import { asArray } from "@/lib/shape";
import GoogleReviewsManager from "@/components/admin/GoogleReviewsManager";

export const dynamic = "force-dynamic";

export default async function GoogleReviewsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", "google_reviews").maybeSingle();
  const draft = (data?.draft ?? {}) as { items?: GoogleReview[]; placeUrl?: string };
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Google Reviews</h1>
      <p className="mt-1 text-sm text-slate-500">
        Paste a review link and we pull what we can; confirm the details and publish.
      </p>
      <GoogleReviewsManager
        initial={asArray<GoogleReview>(draft.items)}
        placeUrl={draft.placeUrl || GOOGLE_PLACE_URL}
      />
    </div>
  );
}
