import type { Metadata } from "next";
import { DiscoveryDirectory } from "@/components/discovery-directory";
import { catalog, paginateItems } from "@/lib/catalog";
import { authorPath, getAuthorGroups } from "@/lib/discovery";
import { firstSearchParam } from "@/lib/search-params";

const pageSize = 48;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}): Promise<Metadata> {
  const requestedPage = Number.parseInt(firstSearchParam((await searchParams).page), 10);
  const page = paginateItems(getAuthorGroups(catalog), requestedPage, pageSize).page;
  const canonical = page > 1 ? `/authors?page=${page}` : "/authors";

  return {
    title: page > 1 ? `作者索引第 ${page} 页` : "作者",
    description: "按作者查找书脉已经整理完成的小说和故事梗概。",
    alternates: { canonical },
  };
}

export default async function AuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const params = await searchParams;
  const authors = getAuthorGroups(catalog);
  const requestedPage = Number.parseInt(firstSearchParam(params.page), 10);
  const pagination = paginateItems(authors, requestedPage, pageSize);

  return (
    <DiscoveryDirectory
      eyebrow="作者索引"
      title="沿一位作者，继续读下去"
      description="从同一位作者的不同作品中，看见反复出现的人物困境、时代背景和叙事选择。"
      items={pagination.items.map((author) => ({
        name: author.name,
        count: author.books.length,
        href: authorPath(author.name),
      }))}
      startIndex={(pagination.page - 1) * pagination.pageSize}
      pagination={{
        pathname: "/authors",
        page: pagination.page,
        totalPages: pagination.totalPages,
        startNumber: pagination.startNumber,
        endNumber: pagination.endNumber,
        totalItems: pagination.totalItems,
      }}
    />
  );
}
