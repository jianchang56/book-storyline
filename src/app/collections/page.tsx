import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { TopicCard } from "@/components/topic-card";
import { catalog } from "@/lib/catalog";
import { getBookCollections } from "@/lib/collections";

export const metadata: Metadata = {
  title: "阅读专题",
  description: "按题材、专题标签和阅读时长浏览由书籍元数据自动生成的阅读专题。",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  const collections = getBookCollections(catalog);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-20 lg:px-8"
      >
        <header className="max-w-3xl">
          <p className="text-sm font-medium tracking-[0.2em] text-primary">阅读专题</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-wide sm:text-5xl">
            不只按书名找书，也按问题进入故事
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            专题成员由每本书的题材、专题标签和阅读时长自动计算。新书发布后，会自然进入符合条件的专题。
          </p>
        </header>
        <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <TopicCard key={collection.slug} collection={collection} />
          ))}
        </div>
      </main>
    </div>
  );
}
