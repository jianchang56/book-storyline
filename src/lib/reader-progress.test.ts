import { describe, expect, it } from "vitest";
import { calculateReaderProgress } from "@/lib/reader-progress";

describe("reader progress", () => {
  it("measures only the reader content bounds", () => {
    const input = { viewportHeight: 800, readerTop: 1000, readerHeight: 2800 };

    expect(calculateReaderProgress({ ...input, scrollY: 500 })).toBe(0);
    expect(calculateReaderProgress({ ...input, scrollY: 2000 })).toBe(50);
    expect(calculateReaderProgress({ ...input, scrollY: 3000 })).toBe(100);
    expect(calculateReaderProgress({ ...input, scrollY: 3600 })).toBe(100);
  });
});
