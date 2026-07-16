"use client";

import { BookMarked, BookOpenCheck, Download, History } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import type { CatalogBook } from "@/lib/catalog";
import { type LibraryReaderState, readLibraryReaderStates } from "@/lib/reader-storage";
import { type OfflineCacheStatus, sendServiceWorkerMessage } from "@/lib/service-worker-client";

export function PersonalShelf({ books }: { books: CatalogBook[] }) {
  const [entries, setEntries] = useState<LibraryReaderState[]>([]);
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const update = useCallback(() => {
    setEntries(
      readLibraryReaderStates(
        window.localStorage,
        books.map((book) => book.slug),
      ),
    );
    setHydrated(true);
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

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }
    const updateOfflineBooks = () => {
      void sendServiceWorkerMessage<OfflineCacheStatus>({ type: "GET_CACHE_STATUS" })
        .then((status) => setSavedSlugs(status.savedSlugs))
        .catch(() => setSavedSlugs([]));
    };
    updateOfflineBooks();
    window.addEventListener("storyline:offline-updated", updateOfflineBooks);
    return () => window.removeEventListener("storyline:offline-updated", updateOfflineBooks);
  }, []);

  const bookBySlug = useMemo(() => new Map(books.map((book) => [book.slug, book])), [books]);
  const reading = entries.flatMap((entry) => {
    const book = bookBySlug.get(entry.slug);
    return book && entry.state.progress < 99 ? [book] : [];
  });
  const saved = entries.flatMap((entry) => {
    const book = bookBySlug.get(entry.slug);
    return book && entry.state.bookmarks.length > 0 ? [book] : [];
  });
  const finished = entries.flatMap((entry) => {
    const book = bookBySlug.get(entry.slug);
    return book &&
      (entry.state.progress >= 99 || entry.state.readChapters.length >= book.chapterCount)
      ? [book]
      : [];
  });
  const offline = savedSlugs.flatMap((slug) => {
    const book = bookBySlug.get(slug);
    return book ? [book] : [];
  });

  if (!hydrated) {
    return <div className="mt-10 h-72 animate-pulse rounded-[2rem] bg-muted/60" />;
  }
  if (entries.length === 0) {
    return (
      <div className="mt-10 rounded-[2rem] border border-dashed border-border bg-card/50 px-6 py-20 text-center">
        <BookMarked className="mx-auto size-10 text-primary" />
        <h2 className="mt-5 font-display text-2xl font-semibold">书架还空着</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
          打开一本书开始阅读后，进度、收藏回目和已读状态会自动保存在这台设备上。
        </p>
        <Button asChild className="mt-6">
          <Link href="/books">去书库选一本</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-16">
      <ShelfSection
        icon={Download}
        title="离线书架"
        books={offline}
        empty="在阅读页选择“固定保存”，即可长期离线阅读。"
      />
      <ShelfSection
        icon={History}
        title="正在阅读"
        books={reading}
        empty="暂时没有读到一半的书。"
      />
      <ShelfSection
        icon={BookMarked}
        title="收藏过的书"
        books={saved}
        empty="收藏任意回目后会出现在这里。"
      />
      <ShelfSection
        icon={BookOpenCheck}
        title="已经读完"
        books={finished}
        empty="完整读完的书会留在这里。"
      />
    </div>
  );
}

function ShelfSection({
  icon: Icon,
  title,
  books,
  empty,
}: {
  icon: typeof History;
  title: string;
  books: CatalogBook[];
  empty: string;
}) {
  return (
    <section>
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{books.length} 本</p>
        </div>
      </div>
      {books.length > 0 ? (
        <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 xl:grid-cols-6">
          {books.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-border px-5 py-8 text-sm text-muted-foreground">
          {empty}
        </p>
      )}
    </section>
  );
}
