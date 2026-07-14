import type { Route } from "next";
import type { CatalogBook } from "@/lib/catalog";

export type CatalogGroup = {
  name: string;
  books: CatalogBook[];
};

export function authorPath(author: string) {
  return `/authors/${encodeURIComponent(author)}` as Route;
}

export function genrePath(genre: string) {
  return `/genres/${encodeURIComponent(genre)}` as Route;
}

export function decodePathSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function groupBooks(books: CatalogBook[], valuesForBook: (book: CatalogBook) => string[]) {
  const groups = new Map<string, CatalogBook[]>();
  for (const book of books) {
    for (const value of valuesForBook(book)) {
      const group = groups.get(value);
      if (group) {
        group.push(book);
      } else {
        groups.set(value, [book]);
      }
    }
  }

  return [...groups.entries()]
    .map(([name, groupedBooks]) => ({ name, books: groupedBooks }))
    .toSorted((a, b) => b.books.length - a.books.length || a.name.localeCompare(b.name, "zh-CN"));
}

export function getAuthorGroups(books: CatalogBook[]) {
  return groupBooks(books, (book) => [book.author]);
}

export function getGenreGroups(books: CatalogBook[]) {
  return groupBooks(books, (book) => book.genres);
}

export function getRelatedBooks(book: CatalogBook, books: CatalogBook[], limit = 4) {
  const genres = new Set(book.genres);

  return books
    .filter((candidate) => candidate.slug !== book.slug)
    .map((candidate) => ({
      book: candidate,
      score:
        (candidate.author === book.author ? 6 : 0) +
        candidate.genres.reduce((total, genre) => total + (genres.has(genre) ? 2 : 0), 0),
    }))
    .toSorted(
      (a, b) =>
        b.score - a.score ||
        b.book.publishedAt.localeCompare(a.book.publishedAt) ||
        a.book.slug.localeCompare(b.book.slug),
    )
    .slice(0, limit)
    .map((candidate) => candidate.book);
}
