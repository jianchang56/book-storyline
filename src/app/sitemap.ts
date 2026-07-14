import type { MetadataRoute } from "next";
import { catalog } from "@/lib/catalog";
import { authorPath, genrePath, getAuthorGroups, getGenreGroups } from "@/lib/discovery";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/books"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/authors"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/genres"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/feedback"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/copyright"), changeFrequency: "yearly", priority: 0.3 },
  ];
  const bookPages: MetadataRoute.Sitemap = catalog.map((book) => ({
    url: absoluteUrl(`/books/${book.slug}`),
    lastModified: book.publishedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const authorPages: MetadataRoute.Sitemap = getAuthorGroups(catalog).map((author) => ({
    url: absoluteUrl(authorPath(author.name)),
    changeFrequency: "weekly",
    priority: 0.6,
  }));
  const genrePages: MetadataRoute.Sitemap = getGenreGroups(catalog).map((genre) => ({
    url: absoluteUrl(genrePath(genre.name)),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...bookPages, ...authorPages, ...genrePages];
}
