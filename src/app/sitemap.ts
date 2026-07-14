import type { MetadataRoute } from "next";
import { catalog } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/books"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
  ];
  const bookPages: MetadataRoute.Sitemap = catalog.map((book) => ({
    url: absoluteUrl(`/books/${book.slug}`),
    lastModified: book.publishedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...bookPages];
}
