import { describe, expect, it } from "vitest";
import { parseBookSection } from "@/lib/books";

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
