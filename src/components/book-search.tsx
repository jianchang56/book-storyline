"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type CatalogBook, filterCatalog } from "@/lib/catalog";

type BookSearchProps = {
  books: CatalogBook[];
  initialQuery?: string;
};

export function BookSearch({ books, initialQuery = "" }: BookSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const filteredBooks = useMemo(() => filterCatalog(books, query), [books, query]);

  return (
    <div>
      <div className="relative mx-auto max-w-2xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索书名、作者或题材"
          aria-label="搜索书名、作者或题材"
          className="h-14 bg-card pr-14 pl-12 shadow-[0_16px_50px_-30px_rgba(20,35,40,0.35)]"
        />
        {query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="清空搜索"
            className="absolute top-1/2 right-1.5 -translate-y-1/2"
            onClick={() => setQuery("")}
          >
            <X />
          </Button>
        ) : null}
      </div>

      <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
        找到 {filteredBooks.length} 本书
      </p>
      {filteredBooks.length > 0 ? (
        <div className="mt-6 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {filteredBooks.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[2rem] border border-dashed border-border bg-card/60 px-6 py-20 text-center">
          <p className="font-display text-2xl font-semibold">书架上还没有这本书</p>
          <p className="mt-3 text-sm text-muted-foreground">换一个书名、作者或题材试试。</p>
        </div>
      )}
    </div>
  );
}
