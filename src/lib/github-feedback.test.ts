import { describe, expect, it } from "vitest";
import { createFeedbackIssueUrl, feedbackFieldLimits } from "@/lib/github-feedback";

describe("GitHub feedback URL", () => {
  it("stays below common request-line limits for maximum Chinese input", () => {
    const issueUrl = createFeedbackIssueUrl({
      book: "书".repeat(feedbackFieldLimits.book),
      location: "章".repeat(feedbackFieldLimits.location),
      type: "事实或事件顺序",
      details: "说明".repeat(feedbackFieldLimits.details / 2),
    });

    expect(issueUrl.toString().length).toBeLessThan(7500);
  });
});
