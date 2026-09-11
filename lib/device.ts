/** Device detection for behaviour that should differ by *device*, not by
 *  window size. Pure and dependency-free so it can be unit-tested. */

/**
 * True for Android, iPhone, iPad and iPod — phones and tablets — and false for
 * every desktop, Windows touch laptops included.
 *
 * Deliberately not a viewport-width check: a narrowed desktop browser window is
 * still a desktop, and a tablet held in landscape is still a tablet. The only
 * reliable signal is the platform itself.
 */
export function isMobileOrTabletUA(ua: string, maxTouchPoints = 0): boolean {
  if (!ua) return false;
  // Windows first: a Surface reports both "Windows NT" and touch support, and
  // it is a desktop OS with no dialler.
  if (/Windows/i.test(ua)) return false;
  if (/Android|iPhone|iPod|iPad/i.test(ua)) return true;
  // iPadOS 13+ identifies itself as macOS. A real Mac reports no touch points,
  // so touch is what separates the two.
  if (/Macintosh|Mac OS X/i.test(ua) && maxTouchPoints > 1) return true;
  return false;
}

/** Browser-side convenience wrapper. Safe to call before hydration. */
export function isMobileOrTablet(): boolean {
  if (typeof navigator === "undefined") return false;
  return isMobileOrTabletUA(navigator.userAgent || "", navigator.maxTouchPoints ?? 0);
}
