import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "关于书脉",
  description: "了解书脉如何把一本书的故事主线整理成清晰、连续、可快速阅读的内容。",
  alternates: { canonical: "/about" },
};

const principles = [
  ["01", "沿因果整理", "保留谁做了什么、为什么发生、造成什么变化，让读者先抓住故事的骨架。"],
  [
    "02",
    "按阶段理解",
    "把长篇旅程分成有起点、有阻碍、有结果的故事阶段，目录帮助定位，不把正文切碎。",
  ],
  [
    "03",
    "连续读完整本",
    "提供全书速览、故事路线和完整梗概三种深度，读者可以从几分钟一路读到整本书。",
  ],
];

const workflow = [
  ["原文", "只使用用户指定的书籍原文，不把影视改编或其他版本混进来。"],
  ["梗概", "按章节记录事件账本，保留决定、转折、结果和会影响后文的线索。"],
  ["发布", "校验章节顺序、人物称号、故事阶段和元数据，再进入连续阅读页面。"],
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="relative overflow-hidden border-b border-border/70">
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <p className="text-sm font-medium tracking-[0.2em] text-primary">关于书脉</p>
            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.08] font-semibold tracking-[0.04em] text-balance sm:text-6xl">
              让一本书的脉络，<span className="text-primary">先被看见。</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
              书脉为想快速读懂小说的人整理故事主线。我们删去不推动情节的铺陈，留下人物选择、关键转折和最终结果。
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="text-sm font-medium tracking-[0.2em] text-primary">阅读方式</p>
              <h2 className="mt-4 max-w-md font-display text-3xl font-semibold tracking-wide sm:text-4xl">
                先搭骨架，再决定读多深
              </h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {principles.map(([number, title, description]) => (
                <article key={number} className="border-t border-border pt-6">
                  <span className="font-mono text-xs text-story-cinnabar">{number}</span>
                  <h3 className="mt-6 font-display text-2xl font-semibold">{title}</h3>
                  <p className="mt-4 leading-7 text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/55">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.2em] text-primary">内容流程</p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-wide sm:text-4xl">
                从原文到书页，每一步都能回查
              </h2>
            </div>
            <div className="mt-12 grid gap-0 border-l border-border lg:grid-cols-3 lg:border-l-0 lg:border-t">
              {workflow.map(([title, description], index) => (
                <article
                  key={title}
                  className="relative border-b border-border py-7 pl-8 lg:border-b-0 lg:border-l lg:py-8 lg:pl-8"
                >
                  <span className="absolute -left-2 top-8 size-3 rounded-full border-2 border-background bg-story-cinnabar lg:-top-2 lg:left-8" />
                  <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                  <h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3>
                  <p className="mt-3 max-w-sm leading-7 text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          <p className="text-sm font-medium tracking-[0.2em] text-primary">现在开始</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold tracking-wide sm:text-4xl">
            找一本书，沿着它的脉络读下去
          </h2>
          <Button asChild size="lg" className="mt-8">
            <Link href="/books">
              进入书库
              <ArrowRight />
            </Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
