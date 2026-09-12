import type { MetadataRoute } from "next";
import { SITE } from "@/lib/data";

/** Search and AI answer engines are welcome everywhere except the admin and
 *  the API. The AI crawlers are named so a future blanket rule elsewhere
 *  never shuts them out by accident. */
const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "Bingbot"];

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/", "/admin"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: AI_CRAWLERS, allow: "/", disallow },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
