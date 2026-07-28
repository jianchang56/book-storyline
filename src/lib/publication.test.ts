import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import {
  compareByPublicationDesc,
  isRecentPublication,
  recentPublicationDays,
} from "@/lib/publication";

describe("isRecentPublication", () => {
  const reference = new Date("2026-07-28T08:00:00Z");

  it("returns true for books published within the recent window", () => {
    expect(isRecentPublication("2026-07-27", reference)).toBe(true);
    expect(isRecentPublication("2026-06-30", reference)).toBe(true);
  });

  it("returns false for older books, future dates and invalid input", () => {
    expect(isRecentPublication("2026-06-01", reference)).toBe(false);
    expect(isRecentPublication("2026-08-01", reference)).toBe(false);
    expect(isRecentPublication("", reference)).toBe(false);
    expect(isRecentPublication("not-a-date", reference)).toBe(false);
  });

  it("treats the boundary day as recent", () => {
    const boundary = new Date(reference.getTime() - recentPublicationDays * 24 * 60 * 60 * 1000);
    expect(isRecentPublication(boundary.toISOString(), reference)).toBe(true);
  });
});

describe("compareByPublicationDesc", () => {
  it("sorts newest first and keeps catalog usable", () => {
    const sorted = [...catalog].sort(compareByPublicationDesc);
    expect(Date.parse(sorted[0].publishedAt)).toBeGreaterThanOrEqual(
      Date.parse(sorted[sorted.length - 1].publishedAt),
    );
    expect(sorted).toHaveLength(catalog.length);
  });
});
