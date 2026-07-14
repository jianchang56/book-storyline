import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookCard } from "@/components/book-card";
import { BookSearch } from "@/components/book-search";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { catalog, filterCatalog, paginateCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "书库",
  description: "搜索故事梗概，按书名、作者和题材快速找到想读的作品。",
  alternates: { canonical: "/books" },
  openGraph: {
    title: "故事书库",
    description: "按书名、作者和题材查找忠于原著的连续故事梗概。",
    url: "/books",
  },
};

const pageSize = 12;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function booksHref(page: number, query: string) {
  return {
    pathname: "/books" as const,
    query: {
      ...(query ? { q: query } : {}),
      ...(page > 1 ? { page: String(page) } : {}),
    },
  };
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = firstValue(params.q).trim();
  const requestedPage = Number.parseInt(firstValue(params.page), 10);
  const filteredBooks = filterCatalog(catalog, query);
  const pagination = paginateCatalog(filteredBooks, requestedPage, pageSize);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium tracking-[0.2em] text-primary">故事书库</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-wide sm:text-5xl">
            找到下一本想读的书
          </h1>
          <p className="mt-5 leading-7 text-muted-foreground">
            已发布作品可以直接阅读；每本书都提供速览、故事路线和完整梗概。
          </p>
        </div>

        <div className="mt-10 sm:mt-14">
          <BookSearch initialQuery={query} resultCount={pagination.totalBooks} />

          {pagination.books.length > 0 ? (
            <>
              <div className="mt-6 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                {pagination.books.map((book) => (
                  <BookCard key={book.slug} book={book} />
                ))}
              </div>

              <nav
                aria-label="书库分页"
                className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row"
              >
                <p className="text-sm text-muted-foreground">
                  显示第 {pagination.startNumber}–{pagination.endNumber} 本，共{" "}
                  {pagination.totalBooks} 本
                </p>
                <div className="flex items-center gap-3">
                  {pagination.page > 1 ? (
                    <Button asChild variant="outline">
                      <Link href={booksHref(pagination.page - 1, query)}>
                        <ChevronLeft />
                        上一页
                      </Link>
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" disabled>
                      <ChevronLeft />
                      上一页
                    </Button>
                  )}
                  <span className="min-w-20 text-center font-mono text-sm text-muted-foreground">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  {pagination.page < pagination.totalPages ? (
                    <Button asChild variant="outline">
                      <Link href={booksHref(pagination.page + 1, query)}>
                        下一页
                        <ChevronRight />
                      </Link>
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" disabled>
                      下一页
                      <ChevronRight />
                    </Button>
                  )}
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
      </main>
    </div>
  );
}
