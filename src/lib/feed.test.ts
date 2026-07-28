import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import { createRssFeed, escapeXml, feedItemLimit } from "@/lib/feed";

describe("escapeXml", () => {
  it("escapes all five XML special characters", () => {
    expect(escapeXml(`a&b<c>d"e'f`)).toBe("a&amp;b&lt;c&gt;d&quot;e&apos;f");
  });
});

describe("createRssFeed", () => {
  const feed = createRssFeed(catalog, new Date("2026-07-28T08:00:00Z"));

  it("produces an rss 2.0 channel with site metadata", () => {
    expect(feed).toContain('<rss version="2.0">');
    expect(feed).toContain("<title>书脉｜新书上架</title>");
    expect(feed).toContain("<language>zh-CN</language>");
    expect(feed).toContain("<lastBuildDate>Tue, 28 Jul 2026 08:00:00 GMT</lastBuildDate>");
  });

  it("caps items at feedItemLimit and orders newest first", () => {
    const titles = [...feed.matchAll(/<title>《(.+?)》/g)].map((match) => match[1]);
    expect(titles.length).toBeLessThanOrEqual(feedItemLimit);
    const publishedAts = catalog
      .filter((book) => titles.includes(book.title))
      .map((book) => book.publishedAt);
    const firstSlug = [...catalog].sort(
      (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
    )[0].title;
    expect(titles[0]).toBe(firstSlug);
    expect(new Set(publishedAts).size).toBeGreaterThan(0);
  });

  it("includes link, guid, pubDate and description for every item", () => {
    const items = feed.split("<item>").slice(1);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item).toContain("<link>https://read.zeet.me/books/");
      expect(item).toContain('<guid isPermaLink="true">');
      expect(item).toContain("<pubDate>");
      expect(item).toContain("<description>");
    }
  });
});
