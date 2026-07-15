import type { Route } from "next";
import type { CatalogBook } from "@/lib/catalog";

type CollectionDefinition = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  shortDescription: string;
  matches: (book: CatalogBook) => boolean;
};

export type BookCollection = Omit<CollectionDefinition, "matches"> & {
  books: CatalogBook[];
};

function hasAnyGenre(book: CatalogBook, genres: ReadonlySet<string>) {
  return book.genres.some((genre) => genres.has(genre));
}

const relationshipGenres = new Set(["爱情", "家庭", "家族", "世情"]);
const adventureGenres = new Set(["冒险", "史诗", "神魔", "江湖", "英雄", "战争"]);
const tragedyGenres = new Set(["悲剧", "复仇", "战争", "宗教文学", "哥特"]);
const identityGenres = new Set(["成长", "自传", "存在主义", "心理", "励志"]);

const collectionDefinitions: CollectionDefinition[] = [
  {
    slug: "four-classics",
    eyebrow: "中国古典",
    title: "四大名著",
    description:
      "从群雄逐鹿、梁山聚义、西天取经到大观园盛衰，沿四部长篇读懂中国古典小说最辽阔的人情与世界。",
    shortDescription: "四部长篇，四种理解中国古典世界的入口。",
    matches: (book) => book.collectionTags?.includes("四大名著") ?? false,
  },
  {
    slug: "beyond-the-classroom",
    eyebrow: "学生书单",
    title: "课堂之外",
    description:
      "从熟悉的经典出发，不为考试划重点，只沿人物、选择与命运重新走进那些值得认真读完的故事。",
    shortDescription: "课堂之外，也值得认真读完的经典。",
    matches: (book) => book.genres.includes("经典") && book.readingMinutes <= 60,
  },
  {
    slug: "before-becoming-yourself",
    eyebrow: "成长专题",
    title: "成为自己之前",
    description:
      "在成长、心理与存在困境中，看一个人如何穿过他人的期待、生活的挫折与内心的迷雾，逐渐辨认自己。",
    shortDescription: "成为自己之前，先要穿过别人定义的世界。",
    matches: (book) => hasAnyGenre(book, identityGenres),
  },
  {
    slug: "love-is-not-the-answer",
    eyebrow: "关系专题",
    title: "爱不是答案",
    description:
      "爱情能够照亮生活，却未必能解决婚姻、家庭、阶层与时代留下的问题。读懂相爱之后仍要面对的一切。",
    shortDescription: "相爱之后，真正的问题才刚刚开始。",
    matches: (book) => hasAnyGenre(book, relationshipGenres),
  },
  {
    slug: "will-fate-spare-anyone",
    eyebrow: "命运专题",
    title: "命运会放过谁",
    description:
      "战争、复仇、信仰与无法撤回的选择交织在一起。追踪人物如何反抗命运，又如何一步步走进早已张开的网。",
    shortDescription: "当命运收紧它的网，谁能真正全身而退？",
    matches: (book) => hasAnyGenre(book, tragedyGenres),
  },
  {
    slug: "into-the-wider-world",
    eyebrow: "远行专题",
    title: "去更大的世界",
    description:
      "离开熟悉的日常，进入海洋、战场、江湖与神话。每一次远行，既是在发现世界，也是在重新认识自己。",
    shortDescription: "离开日常，去海洋、江湖与神话深处。",
    matches: (book) => hasAnyGenre(book, adventureGenres),
  },
];

export function collectionPath(slug: string) {
  return `/collections/${slug}` as Route;
}

export function getBookCollections(books: CatalogBook[]): BookCollection[] {
  return collectionDefinitions
    .map(({ matches, ...collection }) => ({
      ...collection,
      books: books.filter(matches),
    }))
    .filter((collection) => collection.books.length > 0);
}
