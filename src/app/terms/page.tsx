import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "使用条款",
  description: "了解书脉内容和阅读服务的使用范围与责任边界。",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="规则"
      title="使用条款"
      intro="使用书脉即表示你理解：故事梗概帮助快速建立脉络，但不能替代原著本身。"
      updatedAt="2026-07-14"
      sections={[
        {
          title: "内容用途",
          paragraphs: [
            "书脉提供的故事梗概用于阅读辅助、作品理解和一般信息参考。不同版本、译本和章节划分可能存在差异，请在研究、教学或正式引用时回查可靠原文。",
          ],
        },
        {
          title: "准确性与更新",
          paragraphs: [
            "内容由 AI 辅助整理并经过自动校验，但仍可能出现遗漏、理解偏差或表达错误。书脉会根据可靠反馈持续修订，不对内容永远完整或绝对无误作保证。",
          ],
        },
        {
          title: "合理使用",
          paragraphs: [
            "请勿利用本站进行破坏服务、绕过访问限制、冒充书脉发布内容或侵犯第三方合法权益的活动。自动化访问应控制频率，避免影响正常读者。",
          ],
        },
      ]}
    />
  );
}
