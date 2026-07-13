import { ArrowLeft, Clock3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "@/components/book-cover";
import { ReadingChrome } from "@/components/reading-chrome";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

  const sections = [book.overview, ...book.chapters];
  const chapterLinks = sections.map((section) => ({ id: section.id, title: section.title }));

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="border-b border-border/70 bg-card/45">
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

        <div className="mx-auto flex max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <ReadingChrome bookSlug={slug} chapters={chapterLinks} />
          <aside className="sticky top-24 hidden h-fit w-72 shrink-0 rounded-[1.5rem] border border-border bg-card/70 p-5 shadow-sm lg:block xl:hidden">
            <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground">本书信息</p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {book.metadata.description}
            </p>
          </aside>

          <div className="min-w-0 flex-1">
            <article className="mx-auto max-w-[46rem]">
              {sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="chapter-section scroll-mt-28 pb-20 sm:pb-28"
                >
                  <div className="grid grid-cols-[2rem_1fr] gap-4 sm:grid-cols-[2.5rem_1fr] sm:gap-6">
                    <div className="story-spine flex justify-center">
                      <span className="relative z-10 mt-1 flex size-6 items-center justify-center rounded-full border border-border bg-background font-mono text-[9px] text-story-cinnabar shadow-sm sm:size-7">
                        {index === 0 ? "引" : String(index).padStart(2, "0")}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium tracking-[0.18em] text-primary">
                        {index === 0 ? "全书速览" : `情节节点 ${String(index).padStart(2, "0")}`}
                      </p>
                      <h2 className="mt-3 font-display text-2xl leading-snug font-semibold tracking-wide text-balance sm:text-3xl">
                        {section.title}
                      </h2>
                      <Separator className="my-7 bg-border/80" />
                      <div className="reader-copy text-card-foreground">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </article>

            <div className="mx-auto max-w-[43rem] rounded-[2rem] border border-border bg-card p-7 text-center sm:p-10">
              <p className="text-sm font-medium tracking-[0.18em] text-primary">已读完</p>
              <h2 className="mt-4 font-display text-3xl font-semibold">一百回取经故事至此圆满</h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                从石猴出世到五圣成真，原著主因果链已连续呈现。你可以通过目录回到任一回目重读。
              </p>
              <Button asChild variant="outline" className="mt-7">
                <Link href="/books">返回书库</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
