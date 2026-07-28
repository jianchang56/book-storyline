import { catalog } from "@/lib/catalog";
import { createRssFeed } from "@/lib/feed";

export const dynamic = "force-static";

export function GET() {
  return new Response(createRssFeed(catalog), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
