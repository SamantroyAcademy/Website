/** Ask the server to drop its cached CMS reads so an edit goes live at once.
 *  Fire-and-forget: a failure here only means the change appears a few minutes
 *  later, so it must never block or break the save the admin just made. */
export async function bustCmsCache(): Promise<void> {
  try {
    await fetch("/api/admin/revalidate", { method: "POST" });
  } catch {
    /* ignore — content still refreshes when the cache window expires */
  }
}
