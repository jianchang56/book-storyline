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
const tragedyGenres = new Set(["悲剧", "复仇", "哥特"]);
const societyGenres = new Set([
  "成长",
  "现实主义",
  "批判现实主义",
  "社会小说",
  "社会问题剧",
  "革命文学",
  "存在主义",
  "心理",
]);

const collectionDefinitions: CollectionDefinition[] = [
  {
    slug: "one-evening",
    eyebrow: "轻量阅读",
    title: "一晚读完",
    description: "从短篇、戏剧和高度凝练的长篇中，挑选约二十五分钟内可以读完主线的作品。",
    shortDescription: "约二十五分钟内，完整走过一本书的主线。",
    matches: (book) => book.readingMinutes <= 25,
  },
  {
    slug: "long-journeys",
    eyebrow: "长篇纵览",
    title: "百章长卷",
    description: "面向章节众多、人物关系庞杂的长篇巨著，用连续梗概保留完整因果与命运转折。",
    shortDescription: "把百章长卷压成一条仍然清楚的故事线。",
    matches: (book) => book.chapterCount >= 60 || book.readingMinutes >= 90,
  },
  {
    slug: "love-and-family",
    eyebrow: "关系专题",
    title: "爱、婚姻与家庭",
    description: "从爱情、婚姻、家庭与世情出发，比较人物如何在亲密关系与社会规则之间作出选择。",
    shortDescription: "爱情之外，还有婚姻、家庭与时代的压力。",
    matches: (book) => hasAnyGenre(book, relationshipGenres),
  },
  {
    slug: "adventure-and-epic",
    eyebrow: "行动专题",
    title: "冒险、远行与史诗",
    description: "沿海洋、战场、江湖与神魔世界远行，看人物如何在陌生秩序中寻找道路和归宿。",
    shortDescription: "从荒岛到战场，从江湖到神话世界。",
    matches: (book) => hasAnyGenre(book, adventureGenres),
  },
  {
    slug: "fate-and-tragedy",
    eyebrow: "命运专题",
    title: "悲剧、复仇与命运",
    description: "聚焦无法撤回的选择、迟来的真相与复仇代价，追踪悲剧如何一步步成为必然。",
    shortDescription: "看一次选择，如何把所有人推向无法挽回的结局。",
    matches: (book) => hasAnyGenre(book, tragedyGenres),
  },
  {
    slug: "society-and-awakening",
    eyebrow: "社会专题",
    title: "社会、成长与觉醒",
    description: "从现实主义、成长、革命与心理困境切入，阅读个人如何认识自己所处的社会。",
    shortDescription: "个人成长背后，是阶层、制度与时代的塑形。",
    matches: (book) => hasAnyGenre(book, societyGenres),
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
