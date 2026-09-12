/** Pull the 11-character video id out of any YouTube URL form. Plain and
 *  dependency-free so client components can use it (lib/videos.ts is server). */
export function youtubeId(url: string): string | null {
  const m =
    url.match(/[?&]v=([\w-]{11})/) ||
    url.match(/youtu\.be\/([\w-]{11})/) ||
    url.match(/\/embed\/([\w-]{11})/) ||
    url.match(/\/shorts\/([\w-]{11})/);
  return m ? m[1] : null;
}
