"use client";

import { ArrowUpRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BookCover } from "@/components/book-cover";
import { Badge } from "@/components/ui/badge";
import type { CatalogBook } from "@/lib/catalog";
import { type ReaderState, readReaderState } from "@/lib/reader-storage";

export function BookCard({ book }: { book: CatalogBook }) {
  const [readerState, setReaderState] = useState<ReaderState | null>(null);
  const updateReaderState = useCallback(() => {
    setReaderState(readReaderState(window.localStorage, book.slug));
  }, [book.slug]);

  useEffect(() => {
    updateReaderState();
    window.addEventListener("storyline:reader-updated", updateReaderState);
    window.addEventListener("pageshow", updateReaderState);
    return () => {
      window.removeEventListener("storyline:reader-updated", updateReaderState);
      window.removeEventListener("pageshow", updateReaderState);
    };
  }, [updateReaderState]);

  const progress = readerState ? Math.round(readerState.progress) : 0;
  const href = {
    pathname: `/books/${book.slug}`,
    hash: readerState?.lastSectionId,
  };
  const activeReadingMode = readerState
    ? book.readingModes.find((mode) => mode.id === readerState.mode)
    : null;
  const content = (
    <>
      <BookCover
        title={book.title}
        author={book.author}
        tone={book.coverTone}
        era={book.era}
        genres={book.genres}
        chapterCount={book.chapterCount}
        className="w-full transition-transform duration-300 group-hover:-translate-y-1"
      />
      <div className="mt-3 sm:mt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base leading-snug font-semibold tracking-wide sm:text-xl">
              {book.title}
            </h3>
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground sm:text-sm">
              {book.author}
            </p>
          </div>
          {book.status === "published" ? (
            <ArrowUpRight className="mt-1 size-5 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
          ) : (
            <Badge variant="outline">筹备中</Badge>
          )}
        </div>
        <p className="mt-3 hidden line-clamp-2 text-sm leading-6 text-muted-foreground sm:block">
          {book.tagline}
        </p>
        {readerState ? (
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="min-w-0 truncate">继续 · {readerState.lastSectionTitle}</span>
              <span className="shrink-0 font-mono">{progress}%</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-story-cinnabar"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {activeReadingMode?.readingMinutes ?? book.readingMinutes} 分钟 ·{" "}
              {activeReadingMode?.title ?? "完整梗概"}
            </p>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground sm:mt-4 sm:gap-2 sm:text-xs">
            <Clock3 className="size-3.5" />约 {book.readingMinutes} 分钟
          </div>
        )}
      </div>
    </>
  );

  if (book.status === "published") {
    return (
      <Link
        href={href}
        prefetch={false}
        className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        {content}
      </Link>
    );
  }

  return <article className="group opacity-75">{content}</article>;
}
