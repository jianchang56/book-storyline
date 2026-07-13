import type { Metadata } from "next";
import { BookSearch } from "@/components/book-search";
import { SiteHeader } from "@/components/site-header";
import { catalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "书库",
  description: "搜索故事梗概，按书名、作者和题材快速找到想读的作品。",
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium tracking-[0.2em] text-primary">故事书库</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-wide sm:text-5xl">
            找到下一条故事线
          </h1>
          <p className="mt-5 leading-7 text-muted-foreground">
            已发布作品可以直接阅读；筹备中的作品会在梗概完成校验后上线。
          </p>
        </div>
        <div className="mt-10 sm:mt-14">
          <BookSearch books={catalog} initialQuery={q} />
        </div>
      </main>
    </div>
  );
}
