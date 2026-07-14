import { ImageResponse } from "next/og";
import { SocialCard } from "@/components/social-card";
import { siteConfig } from "@/lib/site";

export const alt = "书脉｜沿故事主线读完一本书";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <SocialCard
      eyebrow="故事梗概"
      title="沿故事主线读完一本书"
      description={siteConfig.description}
      footer="三种阅读深度 · 连续阅读"
    />,
    size,
  );
}
