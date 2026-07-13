export const readerStateVersion = 2;

export type ReadingMode = "overview" | "journey" | "complete";
export type ReaderLineHeight = "compact" | "relaxed" | "airy";
export type ReaderWidth = "narrow" | "standard" | "wide";

export type ReaderState = {
  version: number;
  mode: ReadingMode;
  lastSectionId: string;
  lastSectionTitle: string;
  progress: number;
  bookmarks: string[];
  readChapters: string[];
  fontScale: number;
  lineHeight: ReaderLineHeight;
  contentWidth: ReaderWidth;
  updatedAt: string;
};

type StorageReader = Pick<Storage, "getItem" | "removeItem">;

export const readingModeLabels: Record<ReadingMode, { label: string; minutes: string }> = {
  overview: { label: "全书速览", minutes: "5 分钟" },
  journey: { label: "故事路线", minutes: "20 分钟" },
  complete: { label: "完整梗概", minutes: "60 分钟" },
};

export function getReaderStorageKey(bookSlug: string) {
  return `storyline:reader:v${readerStateVersion}:${bookSlug}`;
}

export function createDefaultReaderState(): ReaderState {
  return {
    version: readerStateVersion,
    mode: "complete",
    lastSectionId: "overview",
    lastSectionTitle: "全书速览",
    progress: 0,
    bookmarks: [],
    readChapters: [],
    fontScale: 1,
    lineHeight: "relaxed",
    contentWidth: "standard",
    updatedAt: new Date(0).toISOString(),
  };
}

export function readReaderState(storage: StorageReader, bookSlug: string): ReaderState | null {
  const key = getReaderStorageKey(bookSlug);
  const value = storage.getItem(key);
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<ReaderState>;
    if (
      parsed.version !== readerStateVersion ||
      !parsed.mode ||
      !["overview", "journey", "complete"].includes(parsed.mode) ||
      typeof parsed.lastSectionId !== "string" ||
      typeof parsed.lastSectionTitle !== "string" ||
      typeof parsed.progress !== "number" ||
      !Array.isArray(parsed.bookmarks) ||
      !Array.isArray(parsed.readChapters)
    ) {
      throw new Error("invalid reader state");
    }

    const defaults = createDefaultReaderState();
    return {
      ...defaults,
      ...parsed,
      progress: Math.min(100, Math.max(0, parsed.progress)),
      bookmarks: parsed.bookmarks.filter((item): item is string => typeof item === "string"),
      readChapters: parsed.readChapters.filter((item): item is string => typeof item === "string"),
    };
  } catch {
    storage.removeItem(key);
    return null;
  }
}
