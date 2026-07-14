import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "隐私政策",
  description: "了解书脉如何处理本地阅读状态和反馈信息。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="隐私"
      title="隐私政策"
      intro="书脉以无需账号的阅读体验为默认方案，尽量减少收集和传输个人数据。"
      updatedAt="2026-07-14"
      sections={[
        {
          title: "本地阅读数据",
          paragraphs: [
            "阅读进度、续读位置、阅读档位、收藏、已读状态和排版设置默认保存在浏览器 localStorage 中，不会因为访问页面而自动上传到书脉服务器。",
            "清除浏览器站点数据、使用无痕模式或更换设备可能导致这些本地记录丢失。",
          ],
        },
        {
          title: "反馈信息",
          paragraphs: [
            "内容纠错通过 GitHub Issue 提交，书名、章节位置和具体说明会公开显示。我们只将这些信息用于核查、回复和改进内容，请不要填写个人身份、联系方式或其他敏感信息。",
          ],
        },
      ]}
    />
  );
}
