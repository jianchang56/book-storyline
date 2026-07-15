import catalogSource from "../../content/catalog.json";

export type CoverTone =
  | "amber"
  | "charcoal"
  | "cinnabar"
  | "forest"
  | "heather"
  | "indigo"
  | "ivory"
  | "jade"
  | "lilac"
  | "midnight"
  | "ocean"
  | "ochre"
  | "plum"
  | "rose"
  | "sage"
  | "sand"
  | "slate"
  | "steel"
  | "stone"
  | "sunset"
  | "teal";

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

export function paginateItems<T>(items: T[], requestedPage: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(totalPages, Math.max(1, Math.trunc(requestedPage) || 1));
  const startIndex = (page - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    page,
    pageSize,
    totalItems: items.length,
    totalPages,
    startNumber: items.length === 0 ? 0 : startIndex + 1,
    endNumber: Math.min(startIndex + pageSize, items.length),
  };
}

export function paginateCatalog(books: CatalogBook[], requestedPage: number, pageSize: number) {
  const { items, totalItems, ...pagination } = paginateItems(books, requestedPage, pageSize);
  return {
    ...pagination,
    books: items,
    totalBooks: totalItems,
  };
}
