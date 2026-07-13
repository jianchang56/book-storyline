import { ArrowLeft, Clock3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "@/components/book-cover";
import { BookReader } from "@/components/book-reader";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBook, getBookSlugs } from "@/lib/books";

type BookPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getBookSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) {
    return {};
  }

  return {
    title: `${book.metadata.title}故事梗概`,
    description: book.metadata.description,
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) {
    notFound();
  }

  return (
    <div className="min-h-screen">
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
                    <Badge key={genre} variant="outline">
                      {genre}
                    </Badge>
                  ))}
                </div>
                <h1 className="mt-5 font-display text-4xl font-semibold tracking-[0.08em] sm:text-5xl">
                  {book.metadata.title}
                </h1>
                <p className="mt-3 text-muted-foreground">
                  {book.metadata.era} · {book.metadata.author}
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
      </main>
    </div>
  );
}
