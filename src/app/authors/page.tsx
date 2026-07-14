import type { Metadata } from "next";
import { DiscoveryDirectory } from "@/components/discovery-directory";
import { catalog } from "@/lib/catalog";
import { getAuthorGroups } from "@/lib/discovery";

export const metadata: Metadata = {
  title: "作者",
  description: "按作者查找书脉已经整理完成的小说和故事梗概。",
  alternates: { canonical: "/authors" },
};

export default function AuthorsPage() {
  const authors = getAuthorGroups(catalog);

  return (
    <DiscoveryDirectory
      eyebrow="作者索引"
      title="沿一位作者，继续读下去"
      description="从同一位作者的不同作品中，看见反复出现的人物困境、时代背景和叙事选择。"
      items={authors.map((author) => ({
        name: author.name,
        count: author.books.length,
        href: { pathname: "/authors/[author]", query: { author: author.name } },
      }))}
    />
  );
}
