import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import { getBookCollections } from "@/lib/collections";

describe("metadata-driven collections", () => {
  it("derives every collection from catalog metadata", () => {
    const collections = getBookCollections(catalog);

    expect(collections.length).toBeGreaterThanOrEqual(5);
    expect(collections.every((collection) => collection.books.length > 0)).toBe(true);
    expect(new Set(collections.map((collection) => collection.slug)).size).toBe(collections.length);
  });

  it("updates rule-based collections without maintaining book lists", () => {
    const collections = getBookCollections(catalog);
    const shortReads = collections.find((collection) => collection.slug === "one-evening");
    const longJourneys = collections.find((collection) => collection.slug === "long-journeys");

    expect(shortReads?.books.every((book) => book.readingMinutes <= 25)).toBe(true);
    expect(
      longJourneys?.books.every((book) => book.chapterCount >= 60 || book.readingMinutes >= 90),
    ).toBe(true);
  });
});
