"use client";

import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type CatalogBook, filterCatalog, paginateCatalog } from "@/lib/catalog";
import { compareByPublicationDesc, isRecentPublication } from "@/lib/publication";

const pageSize = 12;

type SortMode = "default" | "latest";

const sortOptions: Array<{ id: SortMode; label: string }> = [
  { id: "default", label: "默认排序" },
  { id: "latest", label: "最新上架" },
];

type BooksBrowserProps = {
  books: CatalogBook[];
  initialQuery?: string;
  initialPage?: number;
  /** 服务端传入的当前时间（ISO 字符串），用于构建期确定"新上架"范围，避免水合不一致。 */
  referenceDate: string;
};

export function BooksBrowser({
  books,
  initialQuery = "",
  initialPage = 1,
  referenceDate,
}: BooksBrowserProps) {
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);
  const [sortMode, setSortMode] = useState<SortMode>("default");

  const reference = useMemo(() => new Date(referenceDate), [referenceDate]);
  const sortedBooks = useMemo(
    () => (sortMode === "latest" ? [...books].sort(compareByPublicationDesc) : books),
    [books, sortMode],
  );
  const filteredBooks = useMemo(() => filterCatalog(sortedBooks, query), [sortedBooks, query]);
  const pagination = paginateCatalog(filteredBooks, page, pageSize);

  // 把当前搜索词和页码静默同步到地址栏（replaceState，不产生历史记录），分享链接可直接定位
  useEffect(() => {
    const params = new URLSearchParams();
    const trimmed = query.trim();
    if (trimmed) {
      params.set("q", trimmed);
    }
    if (pagination.page > 1) {
      params.set("page", String(pagination.page));
    }
    const url = params.size > 0 ? `/books?${params.toString()}` : "/books";
    window.history.replaceState(null, "", url);
  }, [query, pagination.page]);

  const changeSortMode = (mode: SortMode) => {
    setSortMode(mode);
    setPage(1);
  };

  return (
    <div>
      <div className="mx-auto flex max-w-2xl gap-2 sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="搜索书名、作者或题材"
            aria-label="搜索书名、作者或题材"
            autoComplete="off"
            className="h-14 bg-card pl-12 shadow-[0_16px_50px_-30px_rgba(20,35,40,0.35)]"
          />
        </div>
        {query ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-14 shrink-0"
            onClick={() => {
              setQuery("");
              setPage(1);
            }}
            aria-label="清空搜索"
          >
            <X />
          </Button>
        ) : null}
      </div>

      <fieldset className="mt-4 flex items-center justify-center gap-2">
        <legend className="sr-only">排序方式</legend>
        {sortOptions.map((option) => (
          <Button
            key={option.id}
            type="button"
            variant={sortMode === option.id ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={sortMode === option.id}
            onClick={() => changeSortMode(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </fieldset>

      <p aria-live="polite" className="mt-8 text-sm text-muted-foreground">
        找到 {pagination.totalBooks} 本书
      </p>

      {pagination.books.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 xl:grid-cols-6">
            {pagination.books.map((book) => (
              <BookCard
                key={book.slug}
                book={book}
                isNew={isRecentPublication(book.publishedAt, reference)}
              />
            ))}
          </div>

          <nav
            aria-label="书库分页"
            className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row"
          >
            <p className="text-sm text-muted-foreground">
              显示第 {pagination.startNumber}–{pagination.endNumber} 本，共 {pagination.totalBooks}{" "}
              本
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setPage(pagination.page - 1)}
              >
                <ChevronLeft />
                上一页
              </Button>
              <span className="min-w-20 text-center font-mono text-sm text-muted-foreground">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage(pagination.page + 1)}
              >
                下一页
                <ChevronRight />
              </Button>
            </div>
          </nav>
        </>
      ) : (
        <div className="mt-8 rounded-[2rem] border border-dashed border-border bg-card/60 px-6 py-20 text-center">
          <p className="font-display text-2xl font-semibold">书架上还没有这本书</p>
          <p className="mt-3 text-sm text-muted-foreground">换一个书名、作者或题材试试。</p>
        </div>
      )}
    </div>
  );
}
