import { ArrowRight, BookOpen, Clock3, Route, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { BookCard } from "@/components/book-card";
import { BookCover } from "@/components/book-cover";
import { ResumeReadingLink } from "@/components/resume-reading-link";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { catalog } from "@/lib/catalog";

const featuredBook = catalog.find((book) => book.slug === "xiyouji") ?? catalog[0];
const shelfBooks = catalog.slice(0, 5);
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
      <main>
        <section className="relative overflow-hidden border-b border-border/70">
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-28">
            <div>
              <Badge variant="outline" className="border-primary/20 bg-background/60 text-primary">
                <Sparkles className="mr-1.5 size-3.5" />
                忠于原著的故事梗概
              </Badge>
              <h1 className="mt-7 max-w-3xl font-display text-5xl leading-[1.08] font-semibold tracking-[0.04em] text-balance sm:text-6xl lg:text-7xl">
                一条故事线，
                <span className="text-primary">读完一本书。</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
                删去不推动情节的描写，保留人物选择、关键转折与结果。章节连续展开，不用反复翻页。
              </p>
              <form action="/books" className="mt-9 flex max-w-xl gap-3">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="q"
                    placeholder="搜索想读的书"
                    aria-label="搜索想读的书"
                    className="h-13 bg-card pl-12"
                  />
                </div>
                <Button type="submit" size="lg" className="shrink-0 px-5 sm:px-7">
                  去书库
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
                <div className="grid grid-cols-[8rem_1fr] gap-6 sm:grid-cols-[10rem_1fr]">
                  <BookCover
                    title={featuredBook.title}
                    author={featuredBook.author}
                    tone={featuredBook.coverTone}
                  />
                  <div className="story-spine py-1 pl-7">
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

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
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
          <div className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {shelfBooks.map((book) => (
              <BookCard key={book.slug} book={book} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
