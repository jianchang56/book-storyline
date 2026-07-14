import { ArrowLeft, Clock3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCard } from "@/components/book-card";
import { BookCover } from "@/components/book-cover";
import { BookReader } from "@/components/book-reader";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getBook } from "@/lib/books";
import { catalog } from "@/lib/catalog";
import { getRelatedBooks } from "@/lib/discovery";
import { absoluteUrl, siteConfig } from "@/lib/site";

type BookPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
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
      images: [{ url: "/icon.svg", alt: `《${book.metadata.title}》故事梗概` }],
    },
    twitter: {
      card: "summary",
      title: `${book.metadata.title}故事梗概`,
      description: book.metadata.description,
      images: ["/icon.svg"],
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
      "@type": "Book",
      name: book.metadata.title,
      author: { "@type": "Person", name: book.metadata.author },
      description: book.metadata.description,
      genre: book.metadata.genres,
      inLanguage: "zh-CN",
      datePublished: book.metadata.publishedAt,
      url: bookUrl,
      mainEntityOfPage: bookUrl,
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
      <main>
        <section data-book-hero className="border-b border-border/70 bg-card/45">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Button asChild variant="ghost" className="-ml-4">
              <Link href="/books">
                <ArrowLeft />
                返回书库
              </Link>
            </Button>
            <div className="mt-8 grid gap-8 sm:grid-cols-[10rem_1fr] sm:items-end lg:grid-cols-[12rem_1fr]">
              <BookCover
                title={book.metadata.title}
                author={book.metadata.author}
                tone={book.metadata.coverTone}
                className="w-40 sm:w-full"
              />
              <div className="pb-1">
                <div className="flex flex-wrap gap-2">
                  {book.metadata.genres.map((genre) => (
                    <Link
                      key={genre}
                      href={{ pathname: "/genres/[genre]", query: { genre } }}
                      className="inline-flex min-h-11 items-center rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
                <h1 className="mt-5 font-display text-4xl font-semibold tracking-[0.08em] sm:text-5xl">
                  {book.metadata.title}
                </h1>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-muted-foreground">
                  <span>{book.metadata.era}</span>
                  <span aria-hidden="true">·</span>
                  <Link
                    href={{
                      pathname: "/authors/[author]",
                      query: { author: book.metadata.author },
                    }}
                    className="min-h-11 rounded-md py-2 underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {book.metadata.author}
                  </Link>
                </p>
                <p className="mt-5 max-w-2xl text-lg leading-8">{book.metadata.subtitle}</p>
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

        <BookReader book={book} />
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
              <div className="mt-9 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
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
