import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import { getBookCollections } from "@/lib/collections";

describe("metadata-driven collections", () => {
  it("derives every collection from catalog metadata", () => {
    const collections = getBookCollections(catalog);

    expect(collections).toHaveLength(6);
    expect(collections.every((collection) => collection.books.length > 0)).toBe(true);
    expect(new Set(collections.map((collection) => collection.slug)).size).toBe(collections.length);
  });

  it("derives each collection from its metadata rule without maintaining book lists", () => {
    const collections = getBookCollections(catalog);
    const fourClassics = collections.find((collection) => collection.slug === "four-classics");
    const classroom = collections.find((collection) => collection.slug === "beyond-the-classroom");
    const identity = collections.find(
      (collection) => collection.slug === "before-becoming-yourself",
    );
    const relationships = collections.find(
      (collection) => collection.slug === "love-is-not-the-answer",
    );
    const fate = collections.find((collection) => collection.slug === "will-fate-spare-anyone");
    const widerWorld = collections.find((collection) => collection.slug === "into-the-wider-world");

    const identityGenres = new Set(["成长", "自传", "存在主义", "心理", "励志"]);
    const relationshipGenres = new Set(["爱情", "家庭", "家族", "世情"]);
    const fateGenres = new Set(["悲剧", "复仇", "战争", "宗教文学", "哥特"]);
    const widerWorldGenres = new Set(["冒险", "史诗", "神魔", "江湖", "英雄", "战争"]);
    const hasAnyGenre = (genres: string[], expected: Set<string>) =>
      genres.some((genre) => expected.has(genre));

    expect(fourClassics?.books.map((book) => book.title).sort()).toEqual(
      ["三国演义", "水浒传", "红楼梦", "西游记"].sort(),
    );
    expect(
      classroom?.books.every((book) => book.genres.includes("经典") && book.readingMinutes <= 60),
    ).toBe(true);
    expect(identity?.books.every((book) => hasAnyGenre(book.genres, identityGenres))).toBe(true);
    expect(relationships?.books.every((book) => hasAnyGenre(book.genres, relationshipGenres))).toBe(
      true,
    );
    expect(fate?.books.every((book) => hasAnyGenre(book.genres, fateGenres))).toBe(true);
    expect(widerWorld?.books.every((book) => hasAnyGenre(book.genres, widerWorldGenres))).toBe(
      true,
    );
  });
});
