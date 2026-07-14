import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "隐私政策",
  description: "了解书脉如何处理本地阅读状态、反馈信息和匿名访问统计。",
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
          title: "访问统计",
          paragraphs: [
            "站点可以选择启用隐私友好的匿名访问统计，用于了解页面访问、搜索结果和阅读模式使用情况。未配置统计服务时不会加载对应脚本。",
            "书脉不以建立广告画像或出售个人信息为目的使用统计数据。",
          ],
        },
        {
          title: "反馈信息",
          paragraphs: [
            "当你主动通过邮件或其他公开渠道提交纠错时，我们只将提供的信息用于核查、回复和改进内容。请不要在反馈中填写不必要的敏感个人信息。",
          ],
        },
      ]}
    />
  );
}
