import { describe, expect, it } from "vitest";
import { getBook, parseBookSection } from "@/lib/books";

describe("parseBookSection", () => {
  it("extracts the markdown heading and paragraphs", () => {
    expect(parseBookSection("# 第一回　石猴出世\n\n第一段。\n\n第二段。", "备用标题")).toEqual({
      id: "",
      title: "第一回　石猴出世",
      paragraphs: ["第一段。", "第二段。"],
    });
  });

  it("uses a fallback title when the document has no heading", () => {
    expect(parseBookSection("第一段。\n仍在同一段。", "全书速览")).toEqual({
      id: "",
      title: "全书速览",
      paragraphs: ["第一段。 仍在同一段。"],
    });
  });
});

describe("getBook", () => {
  it("loads the complete one-hundred-chapter Journey to the West storyline", async () => {
    const book = await getBook("xiyouji");

    expect(book).not.toBeNull();
    expect(book?.metadata.chapterCount).toBe(100);
    expect(book?.chapters).toHaveLength(100);
    expect(book?.chapters[0]?.title).toBe("第一回　灵根育孕源流出　心性修持大道生");
    expect(book?.chapters.at(-1)?.title).toBe("第一百回　径回东土　五圣成真");
  });
});
