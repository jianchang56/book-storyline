import { ArrowRight, BookOpen, Clock3, Route, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { BookCard } from "@/components/book-card";
import { BookCover } from "@/components/book-cover";
import { ContinueReadingCard } from "@/components/continue-reading-card";
import { ResumeReadingLink } from "@/components/resume-reading-link";
import { SiteHeader } from "@/components/site-header";
import { TopicCard } from "@/components/topic-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { catalog } from "@/lib/catalog";
import { getBookCollections } from "@/lib/collections";

const featuredBook = catalog.find((book) => book.slug === "xiyouji") ?? catalog[0];
const shelfBooks = catalog.slice(0, 5);
const featuredCollections = getBookCollections(catalog).slice(0, 3);
const plotStops = [
  "石猴出世",
  "大闹天宫",
  "玄奘启程",
  "四众聚齐",
  "西行八十一难",
  "灵山取经",
  "五圣成真",
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="relative overflow-hidden border-b border-border/70">
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-28">
            <div>
              <Badge variant="outline" className="border-primary/20 bg-background/60 text-primary">
                <Sparkles className="mr-1.5 size-3.5" />
                忠于原著的故事梗概
              </Badge>
              <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.12] font-semibold tracking-[0.04em] text-balance sm:mt-7 sm:text-6xl sm:leading-[1.08] lg:text-7xl">
                一条故事线，
                <span className="text-primary">读完一本书。</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
                删去不推动情节的描写，保留人物选择、关键转折与结果。章节连续展开，不用反复翻页。
              </p>
              <form action="/books" className="mt-8 flex max-w-xl gap-2 sm:mt-9 sm:gap-3">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="q"
                    placeholder="搜索想读的书"
                    aria-label="搜索想读的书"
                    className="h-13 bg-card pl-12"
                  />
                </div>
                <Button type="submit" size="lg" className="shrink-0 px-4 sm:px-7">
                  <span className="sm:hidden">搜索</span>
                  <span className="hidden sm:inline">去书库</span>
                  <ArrowRight />
                </Button>
              </form>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4 text-primary" />约 60 分钟
                </span>
                <span className="inline-flex items-center gap-2">
                  <Route className="size-4 text-primary" />
                  完整因果链
                </span>
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" />
                  连续阅读
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -top-8 -right-10 size-32 rounded-full bg-story-cinnabar/10 blur-3xl" />
              <div className="rounded-[2rem] border border-border/80 bg-card/80 p-5 shadow-[0_30px_80px_-50px_rgba(19,48,50,0.55)] backdrop-blur sm:p-7">
                <div className="grid grid-cols-[6.75rem_1fr] gap-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <BookCover
                    title={featuredBook.title}
                    author={featuredBook.author}
                    tone={featuredBook.coverTone}
                    genres={featuredBook.genres}
                    chapterCount={featuredBook.chapterCount}
                  />
                  <div className="story-spine py-1 pl-7 [--story-spine-axis:0.375rem]">
                    <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground">
                      百回主线
                    </p>
                    <ol className="mt-4 space-y-3.5">
                      {plotStops.map((stop, index) => (
                        <li key={stop} className="relative flex items-center gap-3 text-sm">
                          <span className="absolute -left-[1.69rem] size-2.5 rounded-full border-2 border-card bg-story-cinnabar shadow-[0_0_0_1px_var(--border)]" />
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>{stop}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
                <ResumeReadingLink bookSlug={featuredBook.slug} bookTitle={featuredBook.title} />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <ContinueReadingCard books={catalog} />
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-medium tracking-[0.2em] text-primary">书架</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-wide sm:text-4xl">
                从一条清楚的主线开始
              </h2>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/books">
                查看全部
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:mt-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 xl:grid-cols-5">
            {shelfBooks.map((book) => (
              <BookCard key={book.slug} book={book} />
            ))}
          </div>
        </section>

        <section className="border-t border-border/70 bg-card/35">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-sm font-medium tracking-[0.2em] text-primary">阅读专题</p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-wide sm:text-4xl">
                  从一个问题，进入一组故事
                </h2>
              </div>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/collections">
                  查看专题
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="-mx-4 mt-8 grid auto-cols-[82%] grid-flow-col gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:auto-cols-[48%] sm:px-0 lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible lg:pb-0">
              {featuredCollections.map((collection) => (
                <TopicCard key={collection.slug} collection={collection} />
              ))}
            </div>
            <Button asChild variant="outline" className="mt-5 w-full sm:hidden">
              <Link href="/collections">
                查看全部专题
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
