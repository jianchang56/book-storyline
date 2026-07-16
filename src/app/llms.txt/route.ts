import { catalog } from "@/lib/catalog";
import { createLlmsText } from "@/lib/llms";

export const dynamic = "force-static";

export function GET() {
  return new Response(createLlmsText(catalog), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
