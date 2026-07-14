"use client";

import {
  ArrowUp,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Focus,
  ListTree,
  Maximize2,
  Minus,
  Plus,
  Search,
  Settings2,
  Share2,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Book, BookSection, StoryArc } from "@/lib/books";
import { calculateReaderProgress } from "@/lib/reader-progress";
import {
  createDefaultReaderState,
  getReaderStorageKey,
  type ReaderLineHeight,
  type ReaderWidth,
  type ReadingMode,
  readerStateVersion,
  readReaderState,
} from "@/lib/reader-storage";
import { cn } from "@/lib/utils";

type ReaderSection = BookSection & {
  kind: ReadingMode;
  chapterNumber?: number;
  arc?: StoryArc;
};

type SearchResult = {
  id: string;
  title: string;
  excerpt: string;
};

const lineHeightValues: Record<ReaderLineHeight, string> = {
  compact: "1.72",
  relaxed: "1.95",
  airy: "2.18",
};

const widthValues: Record<ReaderWidth, string> = {
  narrow: "38rem",
  standard: "46rem",
  wide: "54rem",
};

function splitSummary(summary: string) {
  return summary
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return text;
  }
  const matcher = new RegExp(`(${escapeRegExp(normalizedQuery)})`, "gi");
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(matcher)) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }
    parts.push(
      <mark
        key={`match-${matchIndex}`}
        className="rounded bg-story-cinnabar/20 px-0.5 text-inherit"
      >
        {match[0]}
      </mark>,
    );
    lastIndex = matchIndex + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

function ModePicker({
  mode,
  labels,
  onChange,
}: {
  mode: ReadingMode;
  labels: Record<ReadingMode, { label: string; minutes: string }>;
  onChange: (mode: ReadingMode) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card/70 p-1">
      {(["overview", "journey", "complete"] as ReadingMode[]).map((value) => {
        const item = labels[value];
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={mode === value}
            className={cn(
              "min-h-12 rounded-xl px-2 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              mode === value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <span className="block text-xs font-medium">{item.minutes}</span>
            <span className="mt-0.5 block text-[10px] opacity-75">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TocLink({
  id,
  title,
  marker,
  active,
  bookmarked,
  read,
  onNavigate,
}: {
  id: string;
  title: string;
  marker: string;
  active: boolean;
  bookmarked?: boolean;
  read?: boolean;
  onNavigate: (id: string) => void;
}) {
  return (
    <a
      href={`#${id}`}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(id);
      }}
      className={cn(
        "group flex min-h-11 items-start gap-3 rounded-xl px-3 py-2.5 text-sm leading-5 transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
      aria-current={active ? "location" : undefined}
    >
      <span className="mt-0.5 min-w-5 font-mono text-[10px] opacity-65">{marker}</span>
      <span className="min-w-0 flex-1">{title}</span>
      <span className="mt-0.5 flex shrink-0 items-center gap-1 opacity-70">
        {bookmarked ? <Bookmark className="size-3 fill-current" aria-label="已收藏" /> : null}
        {read ? <Check className="size-3" aria-label="已读" /> : null}
      </span>
    </a>
  );
}

function CompleteToc({
  chapters,
  arcs,
  activeId,
  bookmarks,
  readChapters,
  onNavigate,
}: {
  chapters: BookSection[];
  arcs: StoryArc[];
  activeId: string;
  bookmarks: Set<string>;
  readChapters: Set<string>;
  onNavigate: (id: string) => void;
}) {
  const activeChapter = activeId.startsWith("chapter-") ? Number(activeId.slice(8)) : 0;
  const activeArc = arcs.find(
    (arc) => activeChapter >= arc.startChapter && activeChapter <= arc.endChapter,
  );
  const [openArcs, setOpenArcs] = useState<Set<string>>(() => new Set(arcs[0] ? [arcs[0].id] : []));

  useEffect(() => {
    if (!activeArc) {
      return;
    }
    setOpenArcs((current) => {
      if (current.has(activeArc.id)) {
        return current;
      }
      return new Set([...current, activeArc.id]);
    });
  }, [activeArc]);

  return (
    <nav aria-label="分阶段章节目录" className="space-y-2">
      {arcs.map((arc, arcIndex) => {
        const isOpen = openArcs.has(arc.id);
        const arcChapters = chapters.slice(arc.startChapter - 1, arc.endChapter);
        return (
          <div
            key={arc.id}
            className="overflow-hidden rounded-2xl border border-border/70 bg-card/40"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() =>
                setOpenArcs((current) => {
                  const next = new Set(current);
                  if (next.has(arc.id)) {
                    next.delete(arc.id);
                  } else {
                    next.add(arc.id);
                  }
                  return next;
                })
              }
              className="flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <span className="font-mono text-[10px] text-story-cinnabar">
                {String(arcIndex + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-foreground">{arc.title}</span>
                <span className="mt-0.5 block text-[10px] text-muted-foreground">
                  第 {arc.startChapter}–{arc.endChapter} 回
                </span>
              </span>
              <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen ? (
              <div className="space-y-1 border-t border-border/60 p-1.5">
                {arcChapters.map((chapter, index) => {
                  const chapterNumber = arc.startChapter + index;
                  const id = `chapter-${chapterNumber}`;
                  return (
                    <TocLink
                      key={id}
                      id={id}
                      title={chapter.title}
                      marker={String(chapterNumber).padStart(2, "0")}
                      active={activeId === id}
                      bookmarked={bookmarks.has(id)}
                      read={readChapters.has(id)}
                      onNavigate={onNavigate}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

function ReaderToc({
  book,
  mode,
  activeId,
  bookmarks,
  readChapters,
  onNavigate,
}: {
  book: Book;
  mode: ReadingMode;
  activeId: string;
  bookmarks: Set<string>;
  readChapters: Set<string>;
  onNavigate: (id: string) => void;
}) {
  if (mode === "overview") {
    return (
      <TocLink
        id="overview"
        title={book.overview.title}
        marker="引"
        active={activeId === "overview"}
        onNavigate={onNavigate}
      />
    );
  }
  if (mode === "journey") {
    return (
      <nav aria-label="故事阶段目录" className="space-y-1">
        {book.storyArcs.map((arc, index) => (
          <TocLink
            key={arc.id}
            id={`arc-${arc.id}`}
            title={arc.title}
            marker={String(index + 1).padStart(2, "0")}
            active={activeId === `arc-${arc.id}`}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    );
  }
  return (
    <CompleteToc
      chapters={book.chapters}
      arcs={book.storyArcs}
      activeId={activeId}
      bookmarks={bookmarks}
      readChapters={readChapters}
      onNavigate={onNavigate}
    />
  );
}

function SettingChoices<T extends string>({
  label,
  value,
  choices,
  onChange,
}: {
  label: string;
  value: T;
  choices: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {choices.map((choice) => (
          <button
            key={choice.value}
            type="button"
            onClick={() => onChange(choice.value)}
            aria-pressed={value === choice.value}
            className={cn(
              "min-h-11 rounded-xl border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === choice.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-accent",
            )}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionMessage({ children }: { children: ReactNode }) {
  return (
    <span className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-xl sm:bottom-8">
      {children}
    </span>
  );
}

export function BookReader({ book }: { book: Book }) {
  const defaultState = useMemo(() => createDefaultReaderState(), []);
  const modeLabels = useMemo(
    () =>
      Object.fromEntries(
        book.metadata.readingModes.map((item) => [
          item.id,
          { label: item.title, minutes: `${item.readingMinutes} 分钟` },
        ]),
      ) as Record<ReadingMode, { label: string; minutes: string }>,
    [book.metadata.readingModes],
  );
  const [mode, setMode] = useState<ReadingMode>(defaultState.mode);
  const [activeId, setActiveId] = useState(defaultState.lastSectionId);
  const [progress, setProgress] = useState(defaultState.progress);
  const [bookmarks, setBookmarks] = useState(() => new Set(defaultState.bookmarks));
  const [readChapters, setReadChapters] = useState(() => new Set(defaultState.readChapters));
  const [fontScale, setFontScale] = useState(defaultState.fontScale);
  const [lineHeight, setLineHeight] = useState<ReaderLineHeight>(defaultState.lineHeight);
  const [contentWidth, setContentWidth] = useState<ReaderWidth>(defaultState.contentWidth);
  const [focusMode, setFocusMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const readerRef = useRef<HTMLDivElement>(null);
  const deferredQuery = useDeferredValue(query.trim());

  const arcSections = useMemo<ReaderSection[]>(
    () =>
      book.storyArcs.map((arc) => ({
        id: `arc-${arc.id}`,
        title: arc.title,
        paragraphs: splitSummary(arc.summary),
        kind: "journey",
        arc,
      })),
    [book.storyArcs],
  );
  const chapterSections = useMemo<ReaderSection[]>(
    () =>
      book.chapters.map((chapter, index) => ({
        ...chapter,
        kind: "complete",
        chapterNumber: index + 1,
      })),
    [book.chapters],
  );
  const visibleSections = useMemo<ReaderSection[]>(() => {
    if (mode === "overview") {
      return [{ ...book.overview, kind: "overview" }];
    }
    return mode === "journey" ? arcSections : chapterSections;
  }, [arcSections, book.overview, chapterSections, mode]);
  const titleById = useMemo(() => {
    const entries: Array<[string, string]> = [
      ["overview", book.overview.title],
      ...arcSections.map((section): [string, string] => [section.id, section.title]),
      ...chapterSections.map((section): [string, string] => [section.id, section.title]),
    ];
    return new Map<string, string>(entries);
  }, [arcSections, book.overview.title, chapterSections]);

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!deferredQuery) {
      return [];
    }
    const normalizedQuery = deferredQuery.toLocaleLowerCase("zh-CN");
    const results: SearchResult[] = [];
    for (const chapter of chapterSections) {
      const source = `${chapter.title} ${chapter.paragraphs.join(" ")}`;
      const normalizedSource = source.toLocaleLowerCase("zh-CN");
      const matchIndex = normalizedSource.indexOf(normalizedQuery);
      if (matchIndex === -1) {
        continue;
      }
      const start = Math.max(0, matchIndex - 34);
      const end = Math.min(source.length, matchIndex + deferredQuery.length + 58);
      results.push({
        id: chapter.id,
        title: chapter.title,
        excerpt: `${start > 0 ? "…" : ""}${source.slice(start, end)}${end < source.length ? "…" : ""}`,
      });
      if (results.length === 30) {
        break;
      }
    }
    return results;
  }, [chapterSections, deferredQuery]);

  const navigateTo = useCallback((id: string, targetMode?: ReadingMode) => {
    if (targetMode) {
      startTransition(() => setMode(targetMode));
    }
    setPendingScrollId(id);
    setTocOpen(false);
    setSearchOpen(false);
  }, []);

  const changeMode = useCallback(
    (nextMode: ReadingMode) => {
      const targetId =
        nextMode === "overview"
          ? "overview"
          : nextMode === "journey"
            ? arcSections[0]?.id
            : chapterSections[0]?.id;
      startTransition(() => setMode(nextMode));
      setModeOpen(false);
      if (targetId) {
        setPendingScrollId(targetId);
      }
    },
    [arcSections, chapterSections],
  );

  useEffect(() => {
    const hashId = window.location.hash.slice(1);
    const saved = readReaderState(window.localStorage, book.metadata.slug);
    if (saved) {
      setMode(saved.mode);
      setActiveId(saved.lastSectionId);
      setProgress(saved.progress);
      setBookmarks(new Set(saved.bookmarks));
      setReadChapters(new Set(saved.readChapters));
      setFontScale(saved.fontScale);
      setLineHeight(saved.lineHeight);
      setContentWidth(saved.contentWidth);
    }
    if (hashId && titleById.has(hashId)) {
      const hashMode: ReadingMode =
        hashId === "overview" ? "overview" : hashId.startsWith("arc-") ? "journey" : "complete";
      setMode(hashMode);
      setActiveId(hashId);
      setPendingScrollId(hashId);
    } else if (saved) {
      setPendingScrollId(saved.lastSectionId);
    }
    setHydrated(true);
  }, [book.metadata.slug, titleById]);

  useEffect(() => {
    if (!pendingScrollId) {
      return;
    }
    const targetMode: ReadingMode =
      pendingScrollId === "overview"
        ? "overview"
        : pendingScrollId.startsWith("arc-")
          ? "journey"
          : "complete";
    if (mode !== targetMode) {
      return;
    }
    const targetId = pendingScrollId;
    let secondFrame = 0;
    let retryFrame = 0;
    let retryTimer = 0;
    let attempts = 0;
    const alignTarget = () => {
      const target = document.getElementById(targetId);
      if (!target) {
        return;
      }
      target.scrollIntoView({ block: "start" });
      attempts += 1;
      if (attempts < 3) {
        retryTimer = window.setTimeout(() => {
          retryFrame = window.requestAnimationFrame(alignTarget);
        }, 120);
        return;
      }
      setActiveId(targetId);
      setPendingScrollId(null);
    };
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        alignTarget();
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.cancelAnimationFrame(retryFrame);
      window.clearTimeout(retryTimer);
    };
  }, [mode, pendingScrollId]);

  useEffect(() => {
    const elements = visibleSections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        if (pendingScrollId) {
          return;
        }
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .toSorted((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 },
    );
    for (const element of elements) {
      observer.observe(element);
    }
    return () => observer.disconnect();
  }, [pendingScrollId, visibleSections]);

  useEffect(() => {
    const reader = readerRef.current;
    if (visibleSections.length === 0 || !reader) {
      return;
    }
    let animationFrame = 0;
    const updateProgress = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const bounds = reader.getBoundingClientRect();
        setProgress(
          calculateReaderProgress({
            scrollY: window.scrollY,
            viewportHeight: window.innerHeight,
            readerTop: bounds.top + window.scrollY,
            readerHeight: bounds.height,
          }),
        );
      });
    };
    const resizeObserver = new ResizeObserver(updateProgress);
    resizeObserver.observe(reader);
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [visibleSections]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const timer = window.setTimeout(() => {
      const state = {
        version: readerStateVersion,
        mode,
        lastSectionId: activeId,
        lastSectionTitle: titleById.get(activeId) ?? book.metadata.title,
        progress,
        bookmarks: [...bookmarks],
        readChapters: [...readChapters],
        fontScale,
        lineHeight,
        contentWidth,
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(getReaderStorageKey(book.metadata.slug), JSON.stringify(state));
      window.dispatchEvent(
        new CustomEvent("storyline:reader-updated", { detail: { slug: book.metadata.slug } }),
      );
    }, 350);
    return () => window.clearTimeout(timer);
  }, [
    activeId,
    book.metadata.slug,
    book.metadata.title,
    bookmarks,
    contentWidth,
    fontScale,
    hydrated,
    lineHeight,
    mode,
    progress,
    readChapters,
    titleById,
  ]);

  useEffect(() => {
    if (!hydrated || pendingScrollId || !titleById.has(activeId)) {
      return;
    }
    window.history.replaceState(null, "", `#${activeId}`);
  }, [activeId, hydrated, pendingScrollId, titleById]);

  useEffect(() => {
    document.documentElement.classList.toggle("reader-focus-mode", focusMode);
    return () => document.documentElement.classList.remove("reader-focus-mode");
  }, [focusMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, [contenteditable='true']")) {
        return;
      }
      if (event.key === "/") {
        event.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (event.key.toLocaleLowerCase() === "f") {
        event.preventDefault();
        setFocusMode((value) => !value);
        return;
      }
      if (event.key === "Escape" && focusMode) {
        setFocusMode(false);
        return;
      }
      if (mode !== "complete" || !["j", "k"].includes(event.key.toLocaleLowerCase())) {
        return;
      }
      const activeIndex = chapterSections.findIndex((section) => section.id === activeId);
      const direction = event.key.toLocaleLowerCase() === "j" ? 1 : -1;
      const targetSection = chapterSections[activeIndex + direction];
      if (targetSection) {
        event.preventDefault();
        navigateTo(targetSection.id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeId, chapterSections, focusMode, mode, navigateTo]);

  useEffect(() => {
    if (!actionMessage) {
      return;
    }
    const timer = window.setTimeout(() => setActionMessage(""), 1800);
    return () => window.clearTimeout(timer);
  }, [actionMessage]);

  const toggleBookmark = (id: string) => {
    setBookmarks((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
        setActionMessage("已取消收藏");
      } else {
        next.add(id);
        setActionMessage("已收藏这一回");
      }
      return next;
    });
  };

  const toggleRead = (id: string) => {
    setReadChapters((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
        setActionMessage("已标记为未读");
      } else {
        next.add(id);
        setActionMessage("已标记为已读");
      }
      return next;
    });
  };

  const shareSection = async (section: ReaderSection) => {
    const url = new URL(window.location.href);
    url.hash = section.id;
    const shareData = { title: `${book.metadata.title} · ${section.title}`, url: url.toString() };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url.toString());
      setActionMessage("章节链接已复制");
    } catch {
      setActionMessage("未能分享链接");
    }
  };

  const readerStyle = {
    "--reader-scale": String(fontScale),
    "--reader-line-height": lineHeightValues[lineHeight],
    "--reader-measure": widthValues[contentWidth],
  } as CSSProperties;
  const readPercentage = Math.round((readChapters.size / book.chapters.length) * 100);

  const tocContent = (
    <ReaderToc
      book={book}
      mode={mode}
      activeId={activeId}
      bookmarks={bookmarks}
      readChapters={readChapters}
      onNavigate={navigateTo}
    />
  );

  return (
    <div ref={readerRef} className="reader-shell" style={readerStyle}>
      <div className="fixed top-16 right-0 left-0 z-30 h-0.5 bg-primary/10" aria-hidden="true">
        <div
          className="h-full bg-story-cinnabar transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 pb-28 sm:px-6 sm:py-16 lg:px-8 xl:gap-12">
        <aside
          data-reader-sidebar
          className="sticky top-24 hidden h-[calc(100vh-7rem)] w-80 shrink-0 flex-col self-start xl:flex"
        >
          <ModePicker mode={mode} labels={modeLabels} onChange={changeMode} />
          <div className="mt-5 flex items-center justify-between px-3">
            <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground">阅读路线</p>
            {mode === "complete" ? (
              <span className="font-mono text-[10px] text-muted-foreground">
                已读 {readPercentage}%
              </span>
            ) : null}
          </div>
          <div className="mt-3 min-h-0 overflow-y-auto pr-2">{tocContent}</div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="reader-article mx-auto">
            <div className="mb-14 rounded-[1.75rem] border border-border bg-card/70 p-5 shadow-sm sm:p-6 xl:hidden">
              <p className="mb-3 text-xs font-medium tracking-[0.18em] text-primary">
                选择阅读深度
              </p>
              <ModePicker mode={mode} labels={modeLabels} onChange={changeMode} />
            </div>

            {deferredQuery && mode === "complete" ? (
              <div className="sticky top-20 z-20 mb-8 flex items-center justify-between gap-3 rounded-2xl border border-story-cinnabar/30 bg-background/90 px-4 py-3 text-sm shadow-lg backdrop-blur-xl">
                <span className="min-w-0 truncate">正文中已标记“{deferredQuery}”</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setQuery("")}>
                  清除
                </Button>
              </div>
            ) : null}

            <article>
              {visibleSections.map((section, index) => {
                const isChapter = section.kind === "complete";
                const isBookmarked = bookmarks.has(section.id);
                const isRead = readChapters.has(section.id);
                return (
                  <section
                    key={section.id}
                    id={section.id}
                    className="chapter-section reader-section scroll-mt-28 pb-20 sm:pb-28"
                  >
                    <div className="grid grid-cols-[2rem_1fr] gap-4 sm:grid-cols-[2.5rem_1fr] sm:gap-6">
                      <div className="story-spine flex justify-center">
                        <span className="relative z-10 mt-1 flex size-6 items-center justify-center rounded-full border border-border bg-background font-mono text-[9px] text-story-cinnabar shadow-sm sm:size-7">
                          {section.kind === "overview"
                            ? "引"
                            : String(section.chapterNumber ?? index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs font-medium tracking-[0.18em] text-primary">
                            {section.kind === "overview"
                              ? `${modeLabels.overview.minutes} · ${modeLabels.overview.label}`
                              : section.kind === "journey"
                                ? `${modeLabels.journey.minutes} · ${modeLabels.journey.label} · 第 ${index + 1} 段 · 第 ${section.arc?.startChapter}–${section.arc?.endChapter} 回`
                                : `${modeLabels.complete.label} · 第 ${section.chapterNumber} 回`}
                          </p>
                          <div className="flex items-center gap-1">
                            {isChapter ? (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-10"
                                  aria-label={isBookmarked ? "取消收藏本回" : "收藏本回"}
                                  onClick={() => toggleBookmark(section.id)}
                                >
                                  <Bookmark
                                    className={cn(
                                      isBookmarked && "fill-current text-story-cinnabar",
                                    )}
                                  />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-10"
                                  aria-label={isRead ? "标记本回未读" : "标记本回已读"}
                                  onClick={() => toggleRead(section.id)}
                                >
                                  <CheckCircle2
                                    className={cn(isRead && "fill-primary text-primary-foreground")}
                                  />
                                </Button>
                              </>
                            ) : null}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-10"
                              aria-label="分享当前内容"
                              onClick={() => void shareSection(section)}
                            >
                              <Share2 />
                            </Button>
                          </div>
                        </div>
                        <h2 className="mt-3 font-display text-2xl leading-snug font-semibold tracking-wide text-balance sm:text-3xl">
                          <HighlightedText
                            text={section.title}
                            query={mode === "complete" ? deferredQuery : ""}
                          />
                        </h2>
                        <Separator className="my-7 bg-border/80" />
                        <div className="reader-copy text-card-foreground">
                          {section.paragraphs.map((paragraph) => (
                            <p key={`${section.id}-${paragraph}`}>
                              <HighlightedText
                                text={paragraph}
                                query={mode === "complete" ? deferredQuery : ""}
                              />
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </article>

            <section className="rounded-[2rem] border border-border bg-card p-7 text-center sm:p-10">
              <p className="text-sm font-medium tracking-[0.18em] text-primary">
                {mode === "complete" ? "取经圆满" : "这一档已读完"}
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold">
                {mode === "overview"
                  ? "已经掌握全书主线"
                  : mode === "journey"
                    ? `已经走完 ${book.storyArcs.length} 段故事路线`
                    : `${book.metadata.chapterCount} 回故事至此读完`}
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                {mode === "complete"
                  ? `已标记 ${readChapters.size}/${book.metadata.chapterCount} 回。可以收藏关键回目，或沿故事路线回看整本书。`
                  : "继续进入下一档，可以看到更完整的因果、误会、斗法与人物选择。"}
              </p>
              {mode === "complete" ? (
                <div className="mt-7 grid gap-2 text-left sm:grid-cols-2">
                  {book.storyArcs.map((arc, index) => (
                    <button
                      key={arc.id}
                      type="button"
                      onClick={() => navigateTo(`chapter-${arc.startChapter}`)}
                      className="flex min-h-12 items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="font-mono text-[10px] text-story-cinnabar">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{arc.title}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <Button
                  type="button"
                  className="mt-7"
                  onClick={() => changeMode(mode === "overview" ? "journey" : "complete")}
                >
                  继续读{" "}
                  {mode === "overview"
                    ? `${modeLabels.journey.minutes} ${modeLabels.journey.label}`
                    : `${modeLabels.complete.label}（${book.metadata.chapterCount} 回）`}
                </Button>
              )}
              {mode === "complete" && readChapters.size < book.chapters.length ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-7"
                  onClick={() => {
                    setReadChapters(new Set(chapterSections.map((section) => section.id)));
                    setActionMessage("已将全书标记为已读");
                  }}
                >
                  <CheckCircle2 />
                  全部标记为已读
                </Button>
              ) : null}
            </section>
          </div>
        </main>
      </div>

      {!focusMode ? (
        <>
          <div
            data-reader-mobile-toolbar
            className="fixed right-3 bottom-3 left-3 z-40 grid grid-cols-4 rounded-2xl border border-border bg-background/92 p-1.5 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <Sheet open={tocOpen} onOpenChange={setTocOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 rounded-xl px-2 text-xs"
                  aria-label="打开目录"
                >
                  <ListTree />
                  目录
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[86vh] flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle>阅读路线</SheetTitle>
                  <SheetDescription>
                    目录按故事阶段折叠，章节仍在同一页面连续阅读。
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 min-h-0 overflow-y-auto">{tocContent}</div>
              </SheetContent>
            </Sheet>

            <Button
              type="button"
              variant="ghost"
              className="h-12 rounded-xl px-2 text-xs"
              aria-label="搜索书内内容"
              onClick={() => setSearchOpen(true)}
            >
              <Search />
              搜索
            </Button>

            <Sheet open={modeOpen} onOpenChange={setModeOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 rounded-xl px-2 text-xs"
                  aria-label="切换阅读档位"
                >
                  <Clock3 />
                  档位
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom">
                <SheetHeader className="pr-12">
                  <SheetTitle>选择阅读深度</SheetTitle>
                  <SheetDescription>
                    从全书速览开始，也可以直接进入完整 {book.metadata.chapterCount} 回。
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-5">
                  <ModePicker mode={mode} labels={modeLabels} onChange={changeMode} />
                </div>
              </SheetContent>
            </Sheet>

            <Button
              type="button"
              variant="ghost"
              className="h-12 rounded-xl px-2 text-xs"
              aria-label="调整阅读设置"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 />
              设置
            </Button>
          </div>

          <div className="fixed right-6 bottom-6 z-40 hidden items-center gap-1 rounded-full border border-border bg-background/92 p-1.5 shadow-xl backdrop-blur-xl md:flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="搜索书内内容"
              onClick={() => setSearchOpen(true)}
            >
              <Search />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="复制当前章节链接"
              onClick={() => {
                void navigator.clipboard.writeText(window.location.href);
                setActionMessage("当前链接已复制");
              }}
            >
              <Copy />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="进入专注模式"
              onClick={() => setFocusMode(true)}
            >
              <Focus />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="打开阅读设置"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 />
            </Button>
            <div className="mx-0.5 h-6 w-px bg-border" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="减小字号"
              disabled={fontScale <= 0.9}
              onClick={() =>
                setFontScale((value) => Math.max(0.9, Number((value - 0.1).toFixed(1))))
              }
            >
              <Minus />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="增大字号"
              disabled={fontScale >= 1.3}
              onClick={() =>
                setFontScale((value) => Math.min(1.3, Number((value + 0.1).toFixed(1))))
              }
            >
              <Plus />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="返回顶部"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <ArrowUp />
            </Button>
          </div>

          <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
            <SheetContent side="right" className="flex-col">
              <SheetHeader className="pr-12">
                <SheetTitle>搜索《{book.metadata.title}》</SheetTitle>
                <SheetDescription>按人物、地点、法宝或事件搜索全部回目。</SheetDescription>
              </SheetHeader>
              <SearchPanel
                query={query}
                onQueryChange={setQuery}
                results={searchResults}
                onNavigate={(id) => navigateTo(id, "complete")}
              />
            </SheetContent>
          </Sheet>

          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetContent side="right" className="flex-col overflow-y-auto">
              <SheetHeader className="pr-12">
                <SheetTitle>阅读设置</SheetTitle>
                <SheetDescription>快捷键：J/K 前后回，/ 搜索，F 专注。</SheetDescription>
              </SheetHeader>
              <SettingsPanel
                fontScale={fontScale}
                setFontScale={setFontScale}
                lineHeight={lineHeight}
                setLineHeight={setLineHeight}
                contentWidth={contentWidth}
                setContentWidth={setContentWidth}
                onFocus={() => {
                  setSettingsOpen(false);
                  setFocusMode(true);
                }}
              />
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="fixed top-4 right-4 z-50 bg-background/90 shadow-xl backdrop-blur-xl"
          onClick={() => setFocusMode(false)}
        >
          <Maximize2 />
          退出专注
        </Button>
      )}

      {actionMessage ? <ActionMessage>{actionMessage}</ActionMessage> : null}
    </div>
  );
}

function SearchPanel({
  query,
  onQueryChange,
  results,
  onNavigate,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  results: SearchResult[];
  onNavigate: (id: string) => void;
}) {
  return (
    <div className="mt-5 flex min-h-0 flex-1 flex-col">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="例如：红孩儿、芭蕉扇、女儿国"
          className="pr-5 pl-12"
        />
      </div>
      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {query.trim()
          ? `找到 ${results.length}${results.length === 30 ? "+" : ""} 个相关回目`
          : "输入关键词开始搜索"}
      </p>
      <div className="mt-3 min-h-0 space-y-2 overflow-y-auto pr-1">
        {results.map((result) => (
          <button
            key={result.id}
            type="button"
            onClick={() => onNavigate(result.id)}
            className="w-full rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="font-display font-semibold">
              <HighlightedText text={result.title} query={query} />
            </span>
            <span className="mt-2 block text-sm leading-6 text-muted-foreground">
              <HighlightedText text={result.excerpt} query={query} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel({
  fontScale,
  setFontScale,
  lineHeight,
  setLineHeight,
  contentWidth,
  setContentWidth,
  onFocus,
}: {
  fontScale: number;
  setFontScale: (value: number | ((current: number) => number)) => void;
  lineHeight: ReaderLineHeight;
  setLineHeight: (value: ReaderLineHeight) => void;
  contentWidth: ReaderWidth;
  setContentWidth: (value: ReaderWidth) => void;
  onFocus: () => void;
}) {
  return (
    <div className="mt-6 space-y-7">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">字号</p>
          <span className="font-mono text-xs text-muted-foreground">
            {Math.round(fontScale * 100)}%
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="减小字号"
            disabled={fontScale <= 0.9}
            onClick={() => setFontScale((value) => Math.max(0.9, Number((value - 0.1).toFixed(1))))}
          >
            <Minus />
          </Button>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${((fontScale - 0.9) / 0.4) * 100}%` }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="增大字号"
            disabled={fontScale >= 1.3}
            onClick={() => setFontScale((value) => Math.min(1.3, Number((value + 0.1).toFixed(1))))}
          >
            <Plus />
          </Button>
        </div>
      </div>
      <SettingChoices
        label="行距"
        value={lineHeight}
        choices={[
          { value: "compact", label: "紧凑" },
          { value: "relaxed", label: "舒适" },
          { value: "airy", label: "宽松" },
        ]}
        onChange={setLineHeight}
      />
      <SettingChoices
        label="正文宽度"
        value={contentWidth}
        choices={[
          { value: "narrow", label: "窄" },
          { value: "standard", label: "标准" },
          { value: "wide", label: "宽" },
        ]}
        onChange={setContentWidth}
      />
      <Button type="button" variant="outline" className="w-full" onClick={onFocus}>
        <Focus />
        进入专注模式
      </Button>
      <div className="rounded-2xl bg-muted/70 p-4 text-xs leading-6 text-muted-foreground">
        <p>键盘快捷键</p>
        <p className="mt-1">J / K：下一回 / 上一回 · /：搜索 · F：专注 · Esc：退出专注</p>
      </div>
    </div>
  );
}
