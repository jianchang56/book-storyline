import { describe, expect, it } from "vitest";
import { catalog, filterCatalog } from "@/lib/catalog";

describe("filterCatalog", () => {
  it("returns all books for an empty query", () => {
    expect(filterCatalog(catalog, "  ")).toHaveLength(catalog.length);
  });

  it("matches titles, authors and genres", () => {
    expect(filterCatalog(catalog, "西游").map((book) => book.slug)).toEqual(["xiyouji"]);
    expect(filterCatalog(catalog, "曹雪芹").map((book) => book.slug)).toEqual(["hongloumeng"]);
    expect(filterCatalog(catalog, "历史").map((book) => book.slug)).toEqual(["sanguoyanyi"]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterCatalog(catalog, "不存在的作品")).toEqual([]);
  });
});

describe("generated catalog", () => {
  it("contains unique published books in newest-first order", () => {
    expect(new Set(catalog.map((book) => book.slug)).size).toBe(catalog.length);
    expect(catalog.every((book) => book.status === "published")).toBe(true);
    expect(catalog.map((book) => book.publishedAt)).toEqual(
      catalog
        .map((book) => book.publishedAt)
        .toSorted()
        .reverse(),
    );
  });
});
