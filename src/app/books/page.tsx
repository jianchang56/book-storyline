import type { Metadata } from "next";
import { BooksBrowser } from "@/components/books-browser";
import { SiteHeader } from "@/components/site-header";
import { catalog, filterCatalog, paginateCatalog } from "@/lib/catalog";
import { firstSearchParam } from "@/lib/search-params";

const pageSize = 12;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const query = firstSearchParam(params.q).trim();
  const requestedPage = Number.parseInt(firstSearchParam(params.page), 10);
  const pagination = paginateCatalog(filterCatalog(catalog, query), requestedPage, pageSize);
  const canonical = pagination.page > 1 ? `/books?page=${pagination.page}` : "/books";
  const description = "搜索故事梗概，按书名、作者和题材快速找到想读的作品。";

  return {
    title: pagination.page > 1 ? `书库第 ${pagination.page} 页` : "书库",
    description,
    alternates: { canonical },
    robots: query ? { index: false, follow: true } : undefined,
    openGraph: {
      title: pagination.page > 1 ? `故事书库第 ${pagination.page} 页` : "故事书库",
      description,
      url: canonical,
    },
  };
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = firstSearchParam(params.q).trim();
  const requestedPage = Number.parseInt(firstSearchParam(params.page), 10) || 1;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium tracking-[0.2em] text-primary">故事书库</p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-wide sm:text-5xl">
            找到下一本想读的书
          </h1>
          <p className="mt-5 leading-7 text-muted-foreground">
            已发布作品可以直接阅读；每本书都提供速览、故事路线和完整梗概。
          </p>
        </div>

        <div className="mt-10 sm:mt-14">
          <BooksBrowser
            books={catalog}
            initialQuery={query}
            initialPage={requestedPage}
            referenceDate={new Date().toISOString()}
          />
        </div>
      </main>
    </div>
  );
}
