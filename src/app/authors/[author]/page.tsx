import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookCollectionPage } from "@/components/book-collection-page";
import { catalog } from "@/lib/catalog";
import { getAuthorGroups } from "@/lib/discovery";

type AuthorPageProps = {
  params: Promise<{ author: string }>;
};

const authors = getAuthorGroups(catalog);

export function generateStaticParams() {
  return authors.slice(0, 50).map((author) => ({ author: author.name }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { author } = await params;
  const group = authors.find((item) => item.name === author);
  if (!group) {
    return {};
  }
  return {
    title: `${author}作品故事梗概`,
    description: `阅读书脉已经整理完成的 ${group.books.length} 本${author}作品故事梗概。`,
    alternates: { canonical: `/authors/${encodeURIComponent(author)}` },
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { author } = await params;
  const group = authors.find((item) => item.name === author);
  if (!group) {
    notFound();
  }

  return (
    <BookCollectionPage
      eyebrow="作者作品"
      title={author}
      description={`按发布时间整理 ${author} 的已发布作品，从不同故事中继续理解这位作者。`}
      backHref={{ pathname: "/authors" }}
      backLabel="返回作者索引"
      books={group.books}
    />
  );
}
