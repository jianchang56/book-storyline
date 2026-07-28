import type { CatalogBook } from "@/lib/catalog";
import { compareByPublicationDesc } from "@/lib/publication";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const feedItemLimit = 30;

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toPubDate(publishedAt: string): string {
  const parsed = Date.parse(publishedAt);
  return new Date(Number.isNaN(parsed) ? 0 : parsed).toUTCString();
}

function createFeedItem(book: CatalogBook): string {
  const link = absoluteUrl(`/books/${book.slug}`);
  const categories = book.genres
    .map((genre) => `    <category>${escapeXml(genre)}</category>`)
    .join("\n");
  return `  <item>
    <title>${escapeXml(`《${book.title}》${book.author}`)}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <pubDate>${toPubDate(book.publishedAt)}</pubDate>
    <description>${escapeXml(book.tagline)}</description>
${categories}
  </item>`;
}

/** 生成新书上架 RSS 2.0 订阅源，按上架时间从新到旧取前 feedItemLimit 本。 */
export function createRssFeed(books: CatalogBook[], referenceDate = new Date()): string {
  const items = [...books]
    .sort(compareByPublicationDesc)
    .slice(0, feedItemLimit)
    .map(createFeedItem)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(`${siteConfig.name}｜新书上架`)}</title>
  <link>${absoluteUrl("/books")}</link>
  <description>${escapeXml(siteConfig.description)}</description>
  <language>zh-CN</language>
  <lastBuildDate>${referenceDate.toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>
`;
}
