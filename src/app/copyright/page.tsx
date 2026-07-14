import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "版权说明",
  description: "了解书脉对原著、译本、梗概内容和权利人反馈的处理原则。",
  alternates: { canonical: "/copyright" },
};

export default function CopyrightPage() {
  return (
    <PolicyPage
      eyebrow="版权"
      title="版权说明"
      intro="书脉尊重作者、译者、出版社及其他权利人的合法权益。"
      updatedAt="2026-07-14"
      sections={[
        {
          title: "原著与译本",
          paragraphs: [
            "作品名称、原著正文、译文、封面和相关出版物的权利归各自权利人所有。书脉不以提供受版权保护作品的完整正文或替代正版阅读为目标。",
          ],
        },
        {
          title: "故事梗概",
          paragraphs: [
            "本站内容以事件顺序、人物选择和结果为中心进行重新组织和表达。即使是梗概，也应避免不必要地复制原文中的独特表达、长段对白或完整译文。",
          ],
        },
        {
          title: "权利反馈",
          paragraphs: [
            "如果你认为某项内容侵犯了合法权益，请通过纠错反馈页提供作品名称、具体页面、权利依据和希望采取的措施。我们会优先核查明确、可验证的请求。",
          ],
        },
      ]}
    />
  );
}
