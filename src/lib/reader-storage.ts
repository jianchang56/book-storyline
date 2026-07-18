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

export type LibraryReaderState = {
  slug: string;
  state: ReaderState;
};

type StorageReader = Pick<Storage, "getItem" | "removeItem">;
type StorageWriter = Pick<Storage, "setItem">;

export type ReaderSectionIds = Record<ReadingMode, readonly string[]>;

export function getReaderStorageKey(bookSlug: string) {
  return `storyline:reader:v${readerStateVersion}:${bookSlug}`;
}

export function createDefaultReaderState(): ReaderState {
  return {
    version: readerStateVersion,
    mode: "complete",
    lastSectionId: "chapter-1",
    lastSectionTitle: "完整梗概开篇",
    progress: 0,
    bookmarks: [],
    readChapters: [],
    fontScale: 1,
    lineHeight: "relaxed",
    contentWidth: "standard",
    updatedAt: new Date(0).toISOString(),
  };
}

export function getBrowserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getReadingModeForSectionId(sectionId: string): ReadingMode {
  if (sectionId === "overview") {
    return "overview";
  }
  return sectionId.startsWith("arc-") ? "journey" : "complete";
}

export function normalizeReaderState(
  state: ReaderState,
  sectionIds: ReaderSectionIds,
): ReaderState {
  const availableIds = sectionIds[state.mode];
  const fallback = (
    [
      [state.mode, availableIds[0]],
      ["complete", sectionIds.complete[0]],
      ["journey", sectionIds.journey[0]],
      ["overview", sectionIds.overview[0]],
    ] as const
  ).find((entry): entry is readonly [ReadingMode, string] => typeof entry[1] === "string");
  const validChapterIds = new Set(sectionIds.complete);
  const locationIsValid = availableIds.includes(state.lastSectionId);

  return {
    ...state,
    mode: locationIsValid ? state.mode : (fallback?.[0] ?? state.mode),
    lastSectionId: locationIsValid ? state.lastSectionId : (fallback?.[1] ?? state.lastSectionId),
    bookmarks: [...new Set(state.bookmarks.filter((id) => validChapterIds.has(id)))],
    readChapters: [...new Set(state.readChapters.filter((id) => validChapterIds.has(id)))],
  };
}

export function isReaderStateFinished(state: ReaderState, chapterCount: number) {
  return (
    state.progress >= 99 || (chapterCount > 0 && new Set(state.readChapters).size >= chapterCount)
  );
}

export function readReaderState(
  storage: StorageReader | null | undefined,
  bookSlug: string,
): ReaderState | null {
  if (!storage) {
    return null;
  }
  const key = getReaderStorageKey(bookSlug);

  try {
    const value = storage.getItem(key);
    if (!value) {
      return null;
    }
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
    try {
      storage.removeItem(key);
    } catch {
      // Storage can be unavailable even when a Storage object was obtained earlier.
    }
    return null;
  }
}

export function writeReaderState(
  storage: StorageWriter | null | undefined,
  bookSlug: string,
  state: ReaderState,
) {
  if (!storage) {
    return false;
  }
  try {
    storage.setItem(getReaderStorageKey(bookSlug), JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function readLibraryReaderStates(
  storage: StorageReader | null | undefined,
  bookSlugs: readonly string[],
): LibraryReaderState[] {
  const states: LibraryReaderState[] = [];
  for (const slug of bookSlugs) {
    const state = readReaderState(storage, slug);
    if (state) {
      states.push({ slug, state });
    }
  }
  return states.toSorted((a, b) => b.state.updatedAt.localeCompare(a.state.updatedAt));
}
