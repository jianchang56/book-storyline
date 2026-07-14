import { describe, expect, it } from "vitest";
import { getBook, parseBookChapters, parseBookSection, parseStoryArcs } from "@/lib/books";

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

describe("parseStoryArcs", () => {
  it("extracts stable ids, chapter ranges, titles, and summaries", () => {
    const source = `# 故事路线

## 故事路线

### 01 石猴出世 <!-- arc-id=wukong-origin start=1 end=7 -->

第一段。\n仍在同一段。

### 02 取经缘起 <!-- arc-id=pilgrimage-begins start=8 end=14 -->

第二阶段。`;

    expect(parseStoryArcs(source)).toEqual([
      {
        id: "wukong-origin",
        title: "石猴出世",
        startChapter: 1,
        endChapter: 7,
        summary: "第一段。 仍在同一段。",
      },
      {
        id: "pilgrimage-begins",
        title: "取经缘起",
        startChapter: 8,
        endChapter: 14,
        summary: "第二阶段。",
      },
    ]);
  });
});

describe("parseBookChapters", () => {
  it("splits a continuous Markdown document into stable chapter sections", () => {
    const source = `# 完整梗概

## 第一回　石猴出世

第一段。

## 第二回　悟彻菩提

第二段。\n仍在同一段。`;

    expect(parseBookChapters(source)).toEqual([
      { id: "chapter-1", title: "第一回　石猴出世", paragraphs: ["第一段。"] },
      {
        id: "chapter-2",
        title: "第二回　悟彻菩提",
        paragraphs: ["第二段。 仍在同一段。"],
      },
    ]);
  });
});

describe("getBook", () => {
  it("loads the complete one-hundred-chapter Journey to the West storyline", async () => {
    const book = await getBook("xiyouji");

    expect(book).not.toBeNull();
    expect(book?.metadata.chapterCount).toBe(100);
    expect(book?.storyArcs).toHaveLength(10);
    expect(book?.storyArcs[0]).toMatchObject({
      id: "wukong-origin",
      startChapter: 1,
      endChapter: 7,
    });
    expect(book?.storyArcs.at(-1)).toMatchObject({ startChapter: 96, endChapter: 100 });
    expect(book?.chapters).toHaveLength(100);
    expect(book?.overview.id).toBe("overview");
    expect(book?.chapters[39]?.id).toBe("chapter-40");
    expect(book?.chapters[0]?.title).toBe("第一回　灵根育孕源流出　心性修持大道生");
    expect(book?.chapters.at(-1)?.title).toBe("第一百回　径回东土　五圣成真");
  });
});
