"use client";

import { ArrowUp, ListTree, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ChapterLink = {
  id: string;
  title: string;
};

type ReadingChromeProps = {
  bookSlug: string;
  chapters: ChapterLink[];
};

const progressStorageVersion = 1;

function TocLinks({
  chapters,
  activeId,
  onNavigate,
}: {
  chapters: ChapterLink[];
  activeId: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="章节目录" className="space-y-1">
      {chapters.map((chapter, index) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          onClick={onNavigate}
          className={cn(
            "group flex min-h-11 items-start gap-3 rounded-xl px-3 py-2.5 text-sm leading-5 transition-colors",
            activeId === chapter.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
          aria-current={activeId === chapter.id ? "location" : undefined}
        >
          <span className="mt-0.5 font-mono text-[10px] opacity-65">
            {index === 0 ? "引" : String(index).padStart(2, "0")}
          </span>
          <span>{chapter.title}</span>
        </a>
      ))}
    </nav>
  );
}

export function ReadingChrome({ bookSlug, chapters }: ReadingChromeProps) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "overview");
  const [progress, setProgress] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const sectionElements = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((element): element is HTMLElement => element !== null);

    if (!window.location.hash) {
      const storedProgress = window.localStorage.getItem(`storyline:progress:${bookSlug}`);
      if (storedProgress) {
        try {
          const parsed = JSON.parse(storedProgress) as { version: number; chapterId: string };
          if (parsed.version === progressStorageVersion) {
            window.requestAnimationFrame(() => {
              document.getElementById(parsed.chapterId)?.scrollIntoView();
            });
          }
        } catch {
          window.localStorage.removeItem(`storyline:progress:${bookSlug}`);
        }
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 },
    );

    for (const element of sectionElements) {
      observer.observe(element);
    }

    let animationFrame = 0;
    const updateProgress = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const nextProgress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        setProgress(Math.min(100, Math.max(0, nextProgress)));
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [bookSlug, chapters]);

  useEffect(() => {
    window.localStorage.setItem(
      `storyline:progress:${bookSlug}`,
      JSON.stringify({ version: progressStorageVersion, chapterId: activeId }),
    );
    window.history.replaceState(null, "", `#${activeId}`);
  }, [activeId, bookSlug]);

  useEffect(() => {
    document.documentElement.style.setProperty("--reader-scale", String(fontScale));
  }, [fontScale]);

  return (
    <>
      <div className="fixed top-16 right-0 left-0 z-30 h-0.5 bg-primary/10" aria-hidden="true">
        <div
          className="h-full bg-story-cinnabar transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-72 shrink-0 flex-col self-start xl:flex">
        <p className="mb-4 px-3 text-xs font-medium tracking-[0.2em] text-muted-foreground">
          阅读路线
        </p>
        <div className="min-h-0 overflow-y-auto pr-2">
          <TocLinks chapters={chapters} activeId={activeId} />
        </div>
      </aside>

      <div className="fixed right-4 bottom-4 z-30 flex items-center gap-1 rounded-full border border-border bg-background/90 p-1.5 shadow-xl backdrop-blur-xl sm:right-6 sm:bottom-6">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="ghost" size="icon" aria-label="打开章节目录">
              <ListTree />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[82vh] flex-col">
            <SheetHeader className="pr-12">
              <SheetTitle>章节目录</SheetTitle>
              <SheetDescription>章节连续展示，点击可跳到对应位置。</SheetDescription>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto">
              <TocLinks
                chapters={chapters}
                activeId={activeId}
                onNavigate={() => setSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
        <div className="mx-0.5 h-6 w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="减小字号"
          disabled={fontScale <= 0.9}
          onClick={() => setFontScale((value) => Math.max(0.9, value - 0.1))}
        >
          <Minus />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="增大字号"
          disabled={fontScale >= 1.2}
          onClick={() => setFontScale((value) => Math.min(1.2, value + 0.1))}
        >
          <Plus />
        </Button>
        <div className="mx-0.5 h-6 w-px bg-border" />
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
    </>
  );
}
