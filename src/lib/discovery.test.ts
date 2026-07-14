import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import { getAuthorGroups, getGenreGroups, getRelatedBooks } from "@/lib/discovery";

describe("catalog discovery", () => {
  it("groups books by author and genre", () => {
    const authors = getAuthorGroups(catalog);
    const genres = getGenreGroups(catalog);

    expect(authors.find((group) => group.name === "雨果")?.books).toHaveLength(2);
    expect(genres.find((group) => group.name === "古典小说")?.books.length).toBeGreaterThan(1);
  });

  it("ranks shared authors and genres ahead of unrelated books", () => {
    const book = catalog.find((item) => item.slug === "balishumuyuan");
    expect(book).toBeDefined();
    if (!book) {
      throw new Error("expected catalog fixture");
    }

    const related = getRelatedBooks(book, catalog, 4);
    expect(related[0]?.slug).toBe("beicanshijie");
    expect(related).not.toContainEqual(expect.objectContaining({ slug: book.slug }));
  });
});
