import { MessageSquareWarning, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { FeedbackForm } from "@/components/feedback-form";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "纠错反馈",
  description: "向书脉反馈人物关系、章节标题、事件顺序、表达和版权问题。",
  alternates: { canonical: "/feedback" },
};

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ book?: string | string[] }>;
}) {
  const params = await searchParams;
  const book = Array.isArray(params.book) ? (params.book[0] ?? "") : (params.book ?? "");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <header className="max-w-3xl">
          <p className="text-sm font-medium tracking-[0.2em] text-primary">内容反馈</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-wide sm:text-5xl">
            帮我们把故事线整理得更准确
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            人物身份、事件顺序、回目标题和版本差异都可能影响理解。清楚指出位置和依据，会让修订更快。
          </p>
        </header>
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.65fr_1.35fr]">
          <aside className="rounded-[1.75rem] border border-border bg-card/55 p-6">
            <ShieldCheck className="size-6 text-primary" />
            <h2 className="mt-5 font-display text-2xl font-semibold">反馈时请包含</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>具体书名和章节位置</li>
              <li>当前内容哪里不准确</li>
              <li>建议改成什么</li>
              <li>可以核对的原文依据</li>
            </ul>
            <div className="mt-8 flex items-start gap-3 border-t border-border pt-6 text-sm leading-6 text-muted-foreground">
              <MessageSquareWarning className="mt-0.5 size-5 shrink-0 text-story-cinnabar" />
              版权或下架请求请说明权利身份和具体页面，避免在公开描述中提交敏感信息。
            </div>
          </aside>
          <FeedbackForm initialBook={book} feedbackEmail={process.env.NEXT_PUBLIC_FEEDBACK_EMAIL} />
        </div>
      </main>
    </div>
  );
}
