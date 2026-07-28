import { describe, expect, it } from "vitest";
import { type SearchIndexData, searchIndex } from "@/lib/search-index";

const fixture: SearchIndexData = {
  v: 1,
  generatedAt: "2026-07-28T00:00:00Z",
  books: {
    hongloumeng: { t: "红楼梦", a: "曹雪芹" },
    xiyouji: { t: "西游记", a: "吴承恩" },
    sanguoyanyi: { t: "三国演义", a: "罗贯中" },
  },
  chapters: [
    {
      b: "hongloumeng",
      c: 1,
      h: "第一回　甄士隐梦幻识通灵",
      x: "石头记缘起，贾宝玉与林黛玉的前世因果。",
    },
    { b: "hongloumeng", c: 2, h: "第二回　贾夫人仙逝扬州城", x: "林黛玉丧母，随贾府接引入都。" },
    { b: "xiyouji", c: 1, h: "第一回　灵根育孕源流出", x: "石猴出世，漂洋过海拜菩提祖师学艺。" },
    {
      b: "xiyouji",
      c: 2,
      h: "第二回　悟彻菩提真妙理",
      x: "孙悟空学得七十二变与筋斗云，被逐回花果山。",
    },
    {
      b: "sanguoyanyi",
      c: 1,
      h: "第一回　宴桃园豪杰三结义",
      x: "刘备、关羽、张飞桃园结义，起兵讨黄巾。",
    },
  ],
};

describe("searchIndex", () => {
  it("returns empty for short queries", () => {
    expect(searchIndex(fixture, "孙")).toEqual([]);
    expect(searchIndex(fixture, "  ")).toEqual([]);
  });

  it("matches chapter text and groups by book", () => {
    const groups = searchIndex(fixture, "林黛玉");
    expect(groups).toHaveLength(1);
    expect(groups[0].slug).toBe("hongloumeng");
    expect(groups[0].chapters.map((chapter) => chapter.chapter)).toEqual([1, 2]);
    expect(groups[0].chapters[0].snippet).toContain("林黛玉");
  });

  it("ranks book title matches above body-only matches", () => {
    const groups = searchIndex(fixture, "西游");
    expect(groups[0].slug).toBe("xiyouji");
    expect(groups[0].bestScore).toBeGreaterThanOrEqual(100);
  });

  it("requires all terms to match (AND semantics)", () => {
    expect(searchIndex(fixture, "孙悟空 林黛玉")).toEqual([]);
    const groups = searchIndex(fixture, "孙悟空 花果山");
    expect(groups).toHaveLength(1);
    expect(groups[0].chapters[0].chapter).toBe(2);
  });

  it("caps chapters per group and groups by limit", () => {
    const big: SearchIndexData = {
      ...fixture,
      chapters: Array.from({ length: 20 }, (_, index) => ({
        b: "xiyouji",
        c: index + 1,
        h: `第${index + 1}章`,
        x: "孙悟空",
      })),
    };
    const groups = searchIndex(big, "孙悟空");
    expect(groups[0].chapters).toHaveLength(3);
  });
});
