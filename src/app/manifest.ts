import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "书脉｜沿故事主线读完一本书",
    short_name: "书脉",
    description: "按原著因果顺序整理故事梗概，支持本地书架与离线阅读。",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f2f5f4",
    theme_color: "#275b5b",
    lang: "zh-CN",
    categories: ["books", "education", "literature"],
    icons: [
      {
        src: "/pwa-icon/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
