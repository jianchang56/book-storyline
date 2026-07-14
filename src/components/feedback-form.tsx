"use client";

import { Check, Copy, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FeedbackFormProps = {
  initialBook?: string;
  feedbackEmail?: string;
};

export function FeedbackForm({ initialBook = "", feedbackEmail = "" }: FeedbackFormProps) {
  const [status, setStatus] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const book = String(form.get("book") ?? "").trim();
    const location = String(form.get("location") ?? "").trim();
    const type = String(form.get("type") ?? "").trim();
    const details = String(form.get("details") ?? "").trim();
    const subject = `书脉纠错：${book || "未注明书名"}`;
    const body = [`书名：${book}`, `位置：${location}`, `类型：${type}`, "", details].join("\n");
    if (feedbackEmail) {
      window.location.href = `mailto:${feedbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus("已打开邮件应用");
      return;
    }

    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`);
      setStatus("反馈内容已复制");
    } catch {
      setStatus("复制失败，请手动复制输入内容");
    }
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
            required
          />
        </label>
        <label htmlFor="feedback-location" className="text-sm font-medium">
          章节或故事阶段
          <Input
            id="feedback-location"
            name="location"
            className="mt-2 h-12"
            placeholder="例如：第四十回"
          />
        </label>
      </div>
      <label htmlFor="feedback-type" className="mt-5 block text-sm font-medium">
        问题类型
        <select
          id="feedback-type"
          name="type"
          className="mt-2 min-h-12 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          required
          rows={7}
          placeholder="请说明哪里不准确；如方便，也可以附上原文依据。"
          className="mt-2 w-full resize-y rounded-xl border border-input bg-background px-4 py-3 leading-7 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" className="min-h-12">
          {feedbackEmail ? <Mail /> : <Copy />}
          {feedbackEmail ? "通过邮件提交" : "复制反馈内容"}
        </Button>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {status ? (
            <span className="inline-flex items-center gap-2 text-primary">
              <Check className="size-4" />
              {status}
            </span>
          ) : feedbackEmail ? (
            "提交后会打开你的邮件应用。"
          ) : (
            "站点未配置反馈邮箱，提交后会复制一份结构化文本。"
          )}
        </p>
      </div>
    </form>
  );
}
