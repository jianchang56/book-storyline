import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookCollectionPage } from "@/components/book-collection-page";
import { catalog } from "@/lib/catalog";
import { decodePathSegment, genrePath, getGenreGroups } from "@/lib/discovery";

type GenrePageProps = {
  params: Promise<{ genre: string }>;
};

const genres = getGenreGroups(catalog);

export function generateStaticParams() {
  return genres.slice(0, 50).map((genre) => ({ genre: genre.name }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const genre = decodePathSegment((await params).genre);
  const group = genres.find((item) => item.name === genre);
  if (!group) {
    return {};
  }
  return {
    title: `${genre}故事梗概`,
    description: `浏览书脉已经整理完成的 ${group.books.length} 本${genre}作品。`,
    alternates: { canonical: genrePath(genre) },
  };
}

export default async function GenrePage({ params }: GenrePageProps) {
  const genre = decodePathSegment((await params).genre);
  const group = genres.find((item) => item.name === genre);
  if (!group) {
    notFound();
  }

  return (
    <BookCollectionPage
      eyebrow="作品类型"
      title={genre}
      description={`浏览 ${group.books.length} 本${genre}作品，比较相近题材中的人物选择与故事走向。`}
      backHref={{ pathname: "/genres" }}
      backLabel="返回类型索引"
      books={group.books}
    />
  );
}
