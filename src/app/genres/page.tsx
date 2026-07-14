import type { Metadata } from "next";
import { DiscoveryDirectory } from "@/components/discovery-directory";
import { catalog } from "@/lib/catalog";
import { genrePath, getGenreGroups } from "@/lib/discovery";

export const metadata: Metadata = {
  title: "作品类型",
  description: "按文学类型和题材查找书脉已经整理完成的故事梗概。",
  alternates: { canonical: "/genres" },
};

export default function GenresPage() {
  const genres = getGenreGroups(catalog);

  return (
    <DiscoveryDirectory
      eyebrow="类型索引"
      title="从熟悉的题材，找到下一本书"
      description="按古典小说、现实主义、成长、爱情等类型浏览，沿相近的冲突和人物命运继续阅读。"
      items={genres.map((genre) => ({
        name: genre.name,
        count: genre.books.length,
        href: genrePath(genre.name),
      }))}
    />
  );
}
