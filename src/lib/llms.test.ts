import { describe, expect, it } from "vitest";
import { createLlmsFullText, createLlmsText } from "@/lib/llms";

const books = [
  {
    slug: "example",
    title: "示例书",
    author: "示例作者",
    tagline: "一条示例故事线",
    genres: ["小说", "经典"],
    readingMinutes: 10,
    readingModes: [],
    chapterCount: 12,
    coverTone: "jade" as const,
    publishedAt: "2026-07-16",
    status: "published" as const,
  },
];

describe("LLM discovery documents", () => {
  it("publishes the primary discovery links and content guidance", () => {
    const text = createLlmsText(books);

    expect(text).toContain("# 书脉");
    expect(text).toContain("https://read.zeet.me/llms-full.txt");
    expect(text).toContain("当前收录 1 本作品");
    expect(text).toContain("不是原著全文");
  });

  it("lists every supplied book in the full index", () => {
    const text = createLlmsFullText(books);

    expect(text).toContain("[《示例书》故事梗概](https://read.zeet.me/books/example)");
    expect(text).toContain("示例作者；小说、经典；12 个章节节点");
  });
});
