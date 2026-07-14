"use client";

import { MessageSquarePlus } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FeedbackFormProps = {
  initialBook?: string;
};

export function FeedbackForm({ initialBook = "" }: FeedbackFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const book = String(form.get("book") ?? "").trim();
    const location = String(form.get("location") ?? "").trim();
    const type = String(form.get("type") ?? "").trim();
    const details = String(form.get("details") ?? "").trim();
    const issueUrl = new URL("https://github.com/jianchang56/book-storyline/issues/new");
    issueUrl.searchParams.set("title", `[内容纠错] ${book || "未注明书名"}`);
    issueUrl.searchParams.set(
      "body",
      [
        "## 书籍与位置",
        "",
        `- 书名：${book}`,
        `- 章节或故事阶段：${location || "未注明"}`,
        `- 问题类型：${type}`,
        "",
        "## 具体说明",
        "",
        details,
        "",
        "## 核对依据",
        "",
        "<!-- 如方便，请补充可以核对的原文章节、版本或其他可靠依据。 -->",
      ].join("\n"),
    );
    window.location.assign(issueUrl);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.75rem] border border-border bg-card p-5 sm:p-7"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label htmlFor="feedback-book" className="text-sm font-medium">
          书名
          <Input
            id="feedback-book"
            name="book"
            defaultValue={initialBook}
            className="mt-2 h-12"
            autoComplete="off"
            maxLength={100}
            required
          />
        </label>
        <label htmlFor="feedback-location" className="text-sm font-medium">
          章节或故事阶段
          <Input
            id="feedback-location"
            name="location"
            className="mt-2 h-12"
            autoComplete="off"
            maxLength={200}
            placeholder="例如：第四十回…"
          />
        </label>
      </div>
      <label htmlFor="feedback-type" className="mt-5 block text-sm font-medium">
        问题类型
        <select
          id="feedback-type"
          name="type"
          autoComplete="off"
          className="mt-2 min-h-12 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue="事实或事件顺序"
        >
          <option>事实或事件顺序</option>
          <option>人物身份或关系</option>
          <option>章节标题或数量</option>
          <option>错别字或表达</option>
          <option>版权或下架请求</option>
          <option>其他建议</option>
        </select>
      </label>
      <label htmlFor="feedback-details" className="mt-5 block text-sm font-medium">
        具体说明
        <textarea
          id="feedback-details"
          name="details"
          autoComplete="off"
          maxLength={3000}
          required
          rows={7}
          placeholder="请说明哪里不准确，以及建议如何修改…"
          className="mt-2 w-full resize-y rounded-xl border border-input bg-background px-4 py-3 leading-7 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" className="min-h-12">
          <MessageSquarePlus />在 GitHub 提交 Issue
        </Button>
        <p className="text-sm text-muted-foreground">
          提交后会前往 GitHub，需要登录账号；Issue 内容将公开显示。
        </p>
      </div>
    </form>
  );
}
