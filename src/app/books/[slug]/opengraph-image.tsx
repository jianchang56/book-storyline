import { ImageResponse } from "next/og";
import { SocialCard } from "@/components/social-card";
import { catalog } from "@/lib/catalog";

export const alt = "书脉书籍故事梗概";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BookOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = catalog.find((item) => item.slug === slug);

  return new ImageResponse(
    <SocialCard
      eyebrow="故事梗概"
      title={book?.title ?? "书脉"}
      description={book?.tagline ?? "沿原著因果顺序，快速读懂一本书。"}
      footer={book ? `${book.author} · 约 ${book.readingMinutes} 分钟` : "连续阅读"}
    />,
    size,
  );
}
