import { mask, readIntegrations } from "@/lib/integrations";
import ConnectionsManager from "@/components/admin/ConnectionsManager";

export const dynamic = "force-dynamic";

export default async function ConnectionsAdmin() {
  const i = await readIntegrations();
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Connections</h1>
      <p className="mt-1 text-sm text-slate-500">
        Keys that let the website pull in Google reviews and the latest Instagram and Facebook videos by itself. They are stored privately and never shown to visitors. YouTube needs no key.
      </p>
      <ConnectionsManager
        initial={{
          google: { key: mask(i.googleKey), placeId: i.googlePlaceId },
          instagram: { token: mask(i.instagramToken), savedAt: i.instagramTokenAt },
          facebook: { pageId: i.facebookPageId, token: mask(i.facebookToken) },
        }}
      />
    </div>
  );
}
