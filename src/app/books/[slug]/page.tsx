import { ArrowLeft, BookCheck, CalendarDays, Clock3, MessageSquareWarning } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCard } from "@/components/book-card";
import { BookCover } from "@/components/book-cover";
import { BookReader } from "@/components/book-reader";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getBook, toReaderBook } from "@/lib/books";
import { catalog } from "@/lib/catalog";
import { authorPath, genrePath, getRelatedBooks } from "@/lib/discovery";
import { absoluteUrl, siteConfig } from "@/lib/site";

type BookPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  // Bound build time while dynamicParams generates the remaining books on first request.
  return catalog.slice(0, 24).map((book) => ({ slug: book.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) {
    return {};
  }

  return {
    title: `${book.metadata.title}故事梗概`,
    description: book.metadata.description,
    alternates: { canonical: `/books/${slug}` },
    openGraph: {
      type: "article",
      locale: "zh_CN",
      siteName: siteConfig.name,
      url: `/books/${slug}`,
      title: `${book.metadata.title}故事梗概`,
      description: book.metadata.description,
      publishedTime: book.metadata.publishedAt,
      authors: [book.metadata.author],
      tags: book.metadata.genres,
      images: [
        {
          url: `/books/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `《${book.metadata.title}》故事梗概`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${book.metadata.title}故事梗概`,
      description: book.metadata.description,
      images: [`/books/${slug}/opengraph-image`],
    },
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) {
    notFound();
  }
  const bookUrl = absoluteUrl(`/books/${slug}`);
  const catalogBook = catalog.find((item) => item.slug === slug);
  const relatedBooks = catalogBook ? getRelatedBooks(catalogBook, catalog) : [];
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${book.metadata.title}故事梗概`,
      description: book.metadata.description,
      inLanguage: "zh-CN",
      ...(/^\d{4}-\d{2}-\d{2}$/.test(book.metadata.publishedAt)
        ? { datePublished: book.metadata.publishedAt }
        : {}),
      author: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
      publisher: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
      url: bookUrl,
      mainEntityOfPage: bookUrl,
      image: absoluteUrl(`/books/${slug}/opengraph-image`),
      about: {
        "@type": "Book",
        name: book.metadata.title,
        author: { "@type": "Person", name: book.metadata.author },
        genre: book.metadata.genres,
        inLanguage: "zh-CN",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "首页", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "书库", item: absoluteUrl("/books") },
        { "@type": "ListItem", position: 3, name: book.metadata.title, item: bookUrl },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <JsonLd data={structuredData} />
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section data-book-hero className="border-b border-border/70 bg-card/45">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Button asChild variant="ghost" className="-ml-4">
              <Link href="/books">
                <ArrowLeft />
                返回书库
              </Link>
            </Button>
            <div className="mt-6 grid grid-cols-[7.5rem_1fr] items-end gap-5 sm:mt-8 sm:grid-cols-[10rem_1fr] sm:gap-8 lg:grid-cols-[12rem_1fr]">
              <BookCover
                title={book.metadata.title}
                author={book.metadata.author}
                tone={book.metadata.coverTone}
                genres={book.metadata.genres}
                chapterCount={book.metadata.chapterCount}
                className="w-full"
              />
              <div className="pb-1">
                <div className="flex flex-wrap gap-2">
                  {book.metadata.genres.map((genre) => (
                    <Link
                      key={genre}
                      href={genrePath(genre)}
                      className="inline-flex min-h-11 items-center rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
                <h1 className="mt-4 font-display text-3xl font-semibold tracking-[0.06em] sm:mt-5 sm:text-5xl sm:tracking-[0.08em]">
                  {book.metadata.title}
                </h1>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-muted-foreground">
                  <span>{book.metadata.era}</span>
                  <span aria-hidden="true">·</span>
                  <Link
                    href={authorPath(book.metadata.author)}
                    className="min-h-11 rounded-md py-2 underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {book.metadata.author}
                  </Link>
                </p>
                <p className="mt-4 hidden max-w-2xl text-lg leading-8 sm:block">
                  {book.metadata.subtitle}
                </p>
                <div className="mt-6 flex flex-wrap gap-5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="size-4 text-primary" />约 {book.metadata.readingMinutes} 分钟
                  </span>
                  <span>{book.metadata.chapterCount} 个章节节点</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border/70 bg-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <BookCheck className="size-4 text-primary" />
                覆盖 {book.metadata.chapterCount} 个章节节点
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                发布于 {book.metadata.publishedAt}
              </span>
              <span>AI 辅助整理 · 自动校验</span>
            </div>
            <Button asChild variant="outline" className="min-h-11 shrink-0 self-start lg:self-auto">
              <Link href={{ pathname: "/feedback", query: { book: book.metadata.title } }}>
                <MessageSquareWarning />
                反馈内容问题
              </Link>
            </Button>
          </div>
        </section>

        <BookReader book={toReaderBook(book)} />
        {relatedBooks.length > 0 ? (
          <section className="border-t border-border/70 bg-card/35">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
              <p className="text-sm font-medium tracking-[0.2em] text-primary">继续阅读</p>
              <div className="mt-3 flex items-end justify-between gap-5">
                <h2 className="font-display text-3xl font-semibold tracking-wide">
                  与这本书相关的作品
                </h2>
                <Link href="/books" className="text-sm text-primary hover:underline">
                  查看书库
                </Link>
              </div>
              <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-7 sm:gap-y-12 lg:grid-cols-4">
                {relatedBooks.map((relatedBook) => (
                  <BookCard key={relatedBook.slug} book={relatedBook} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
