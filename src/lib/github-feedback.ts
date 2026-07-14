export const feedbackFieldLimits = {
  book: 60,
  location: 80,
  details: 500,
} as const;

type FeedbackIssueInput = {
  book: string;
  location: string;
  type: string;
  details: string;
};

export function createFeedbackIssueUrl({ book, location, type, details }: FeedbackIssueInput) {
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
  return issueUrl;
}
