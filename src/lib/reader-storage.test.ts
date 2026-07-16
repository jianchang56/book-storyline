import { describe, expect, it, vi } from "vitest";
import {
  createDefaultReaderState,
  getReaderStorageKey,
  readerStateVersion,
  readLibraryReaderStates,
  readReaderState,
} from "@/lib/reader-storage";

describe("reader storage", () => {
  it("uses a section that belongs to the default reading mode", () => {
    expect(createDefaultReaderState()).toMatchObject({
      mode: "complete",
      lastSectionId: "chapter-1",
    });
  });

  it("uses a versioned per-book key", () => {
    expect(getReaderStorageKey("xiyouji")).toBe(`storyline:reader:v${readerStateVersion}:xiyouji`);
  });

  it("loads a valid saved state", () => {
    const saved = {
      ...createDefaultReaderState(),
      mode: "journey" as const,
      lastSectionId: "arc-wukong-origin",
      lastSectionTitle: "石猴出世与大闹天宫",
      progress: 28,
    };
    const storage = {
      getItem: vi.fn(() => JSON.stringify(saved)),
      removeItem: vi.fn(),
    };

    expect(readReaderState(storage, "xiyouji")).toMatchObject(saved);
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it("removes incompatible state", () => {
    const storage = {
      getItem: vi.fn(() => JSON.stringify({ version: 1 })),
      removeItem: vi.fn(),
    };

    expect(readReaderState(storage, "xiyouji")).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith(getReaderStorageKey("xiyouji"));
  });

  it("loads library states in most-recently-read order", () => {
    const states = new Map([
      [
        getReaderStorageKey("xiyouji"),
        JSON.stringify({
          ...createDefaultReaderState(),
          updatedAt: "2026-07-15T09:00:00.000Z",
        }),
      ],
      [
        getReaderStorageKey("hongloumeng"),
        JSON.stringify({
          ...createDefaultReaderState(),
          updatedAt: "2026-07-15T10:00:00.000Z",
        }),
      ],
    ]);
    const storage = {
      getItem: vi.fn((key: string) => states.get(key) ?? null),
      removeItem: vi.fn(),
    };

    expect(readLibraryReaderStates(storage, ["xiyouji", "hongloumeng"])).toMatchObject([
      { slug: "hongloumeng" },
      { slug: "xiyouji" },
    ]);
  });
});
