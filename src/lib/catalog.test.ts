import { describe, expect, it } from "vitest";
import { catalog, filterCatalog, paginateCatalog, paginateItems } from "@/lib/catalog";

describe("filterCatalog", () => {
  it("returns all books for an empty query", () => {
    expect(filterCatalog(catalog, "  ")).toHaveLength(catalog.length);
  });

  it("matches titles, authors and genres", () => {
    expect(filterCatalog(catalog, "西游").map((book) => book.slug)).toEqual(["xiyouji"]);
    expect(filterCatalog(catalog, "曹雪芹").map((book) => book.slug)).toEqual(["hongloumeng"]);
    expect(filterCatalog(catalog, "历史").map((book) => book.slug)).toEqual([
      "shuangchengji",
      "weinasidedansheng",
      "sanguoyanyi",
    ]);
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

describe("paginateCatalog", () => {
  it("paginates generic directory items", () => {
    expect(paginateItems(["a", "b", "c"], 2, 2)).toMatchObject({
      items: ["c"],
      page: 2,
      totalItems: 3,
      totalPages: 2,
      startNumber: 3,
      endNumber: 3,
    });
  });

  it("returns one bounded page without losing total counts", () => {
    const pageSize = 12;
    const result = paginateCatalog(catalog, 2, pageSize);

    expect(result.page).toBe(2);
    expect(result.books).toHaveLength(Math.min(pageSize, Math.max(0, catalog.length - pageSize)));
    expect(result.totalBooks).toBe(catalog.length);
    expect(result.totalPages).toBe(Math.ceil(catalog.length / pageSize));
    expect(result.startNumber).toBe(pageSize + 1);
    expect(result.endNumber).toBe(Math.min(catalog.length, pageSize * 2));
  });

  it("clamps invalid pages and handles empty results", () => {
    expect(paginateCatalog(catalog, 999, 12).page).toBe(Math.ceil(catalog.length / 12));
    expect(paginateCatalog(catalog, -5, 12).page).toBe(1);
    expect(paginateCatalog([], 3, 12)).toMatchObject({
      books: [],
      page: 1,
      totalBooks: 0,
      totalPages: 1,
      startNumber: 0,
      endNumber: 0,
    });
  });
});
