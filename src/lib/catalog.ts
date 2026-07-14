import catalogSource from "../../content/catalog.json";

export type CoverTone = "cinnabar" | "indigo" | "jade" | "plum" | "sand";

export type CatalogBook = {
  slug: string;
  title: string;
  author: string;
  tagline: string;
  genres: string[];
  readingMinutes: number;
  chapterCount: number;
  coverTone: CoverTone;
  publishedAt: string;
  status: "published" | "preparing";
};

export const catalog = catalogSource as CatalogBook[];

export function filterCatalog(books: CatalogBook[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  if (!normalizedQuery) {
    return books;
  }

  return books.filter((book) => {
    const searchable = [book.title, book.author, book.tagline, ...book.genres]
      .join(" ")
      .toLocaleLowerCase("zh-CN");
    return searchable.includes(normalizedQuery);
  });
}

export function paginateCatalog(books: CatalogBook[], requestedPage: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(books.length / pageSize));
  const page = Math.min(totalPages, Math.max(1, Math.trunc(requestedPage) || 1));
  const startIndex = (page - 1) * pageSize;

  return {
    books: books.slice(startIndex, startIndex + pageSize),
    page,
    pageSize,
    totalBooks: books.length,
    totalPages,
    startNumber: books.length === 0 ? 0 : startIndex + 1,
    endNumber: Math.min(startIndex + pageSize, books.length),
  };
}
