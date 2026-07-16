"use client";

import { ArrowRight, Bookmark } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BookCover } from "@/components/book-cover";
import { Button } from "@/components/ui/button";
import type { CatalogBook } from "@/lib/catalog";
import { type LibraryReaderState, readLibraryReaderStates } from "@/lib/reader-storage";

export function ContinueReadingCard({ books }: { books: CatalogBook[] }) {
  const [latest, setLatest] = useState<LibraryReaderState | null>(null);
  const update = useCallback(() => {
    setLatest(
      readLibraryReaderStates(
        window.localStorage,
        books.map((book) => book.slug),
      )[0] ?? null,
    );
  }, [books]);

  useEffect(() => {
    update();
    window.addEventListener("storyline:reader-updated", update);
    window.addEventListener("pageshow", update);
    return () => {
      window.removeEventListener("storyline:reader-updated", update);
      window.removeEventListener("pageshow", update);
    };
  }, [update]);

  const book = latest ? books.find((item) => item.slug === latest.slug) : null;
  if (!latest || !book || latest.state.updatedAt === new Date(0).toISOString()) {
    return null;
  }

  const progress = Math.round(latest.state.progress);
  return (
    <section className="mb-12 overflow-hidden rounded-[2rem] border border-border bg-card/70 p-5 shadow-[0_24px_70px_-54px_rgba(18,38,40,0.7)] sm:mb-16 sm:p-7">
      <div className="grid grid-cols-[5rem_1fr] items-center gap-5 sm:grid-cols-[6.5rem_1fr_auto] sm:gap-7">
        <BookCover
          title={book.title}
          author={book.author}
          tone={book.coverTone}
          era={book.era}
          genres={book.genres}
          chapterCount={book.chapterCount}
        />
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-primary">
            <Bookmark className="size-3.5" /> 最近阅读
          </p>
          <h2 className="mt-2 truncate font-display text-xl font-semibold sm:text-3xl">
            {book.title}
          </h2>
          <p className="mt-2 truncate text-sm text-muted-foreground">
            {latest.state.lastSectionTitle}
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-story-cinnabar"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-xs text-muted-foreground">已读 {progress}%</p>
        </div>
        <Button asChild className="col-span-2 sm:col-span-1">
          <Link href={{ pathname: `/books/${book.slug}`, hash: latest.state.lastSectionId }}>
            继续阅读
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
