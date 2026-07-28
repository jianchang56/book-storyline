import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteSearch } from "@/components/site-search";

export const metadata: Metadata = {
  title: "全站搜索",
  description: "在全部书目的完整梗概中搜索书名、作者、人物和情节关键词，定位到具体章节。",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium tracking-[0.2em] text-primary">全站搜索</p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-wide sm:text-5xl">
            搜索人物与情节
          </h1>
          <p className="mt-5 leading-7 text-muted-foreground">
            在全部书目的完整梗概中查找，直接定位到具体章节继续阅读。
          </p>
        </div>

        <div className="mt-10 sm:mt-14">
          <SiteSearch />
        </div>
      </main>
    </div>
  );
}
