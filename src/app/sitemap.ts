import type { MetadataRoute } from "next";
import { catalog } from "@/lib/catalog";
import { collectionPath, getBookCollections } from "@/lib/collections";
import { authorPath, genrePath, getAuthorGroups, getGenreGroups } from "@/lib/discovery";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/books"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/collections"), changeFrequency: "weekly", priority: 0.8 },
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
    lastModified: /^\d{4}-\d{2}-\d{2}$/.test(book.publishedAt) ? book.publishedAt : undefined,
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
  const collectionPages: MetadataRoute.Sitemap = getBookCollections(catalog).map((collection) => ({
    url: absoluteUrl(collectionPath(collection.slug)),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...bookPages, ...collectionPages, ...authorPages, ...genrePages];
}
