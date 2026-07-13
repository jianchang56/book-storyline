export type CoverTone = "cinnabar" | "indigo" | "jade" | "plum" | "sand";

export type CatalogBook = {
  slug: string;
  title: string;
  author: string;
  tagline: string;
  genres: string[];
  readingMinutes: number;
  coverTone: CoverTone;
  status: "published" | "preparing";
};

export const catalog: CatalogBook[] = [
  {
    slug: "xiyouji",
    title: "西游记",
    author: "吴承恩",
    tagline: "从石猴出世到五行山下，七回读完大圣前传。",
    genres: ["古典小说", "神魔", "冒险"],
    readingMinutes: 12,
    coverTone: "cinnabar",
    status: "published",
  },
  {
    slug: "sanguoyanyi",
    title: "三国演义",
    author: "罗贯中",
    tagline: "从群雄并起到三分归晋，理清一百二十回兴亡脉络。",
    genres: ["古典小说", "历史", "战争"],
    readingMinutes: 48,
    coverTone: "indigo",
    status: "preparing",
  },
  {
    slug: "hongloumeng",
    title: "红楼梦",
    author: "曹雪芹",
    tagline: "沿人物关系与家族盛衰，读懂大观园里的情与命。",
    genres: ["古典小说", "世情", "家族"],
    readingMinutes: 42,
    coverTone: "plum",
    status: "preparing",
  },
  {
    slug: "liaozhai",
    title: "聊斋志异",
    author: "蒲松龄",
    tagline: "狐鬼花妖之外，是人情、欲望与世道的短篇群像。",
    genres: ["志怪", "短篇", "古典小说"],
    readingMinutes: 36,
    coverTone: "jade",
    status: "preparing",
  },
  {
    slug: "shuihuzhuan",
    title: "水浒传",
    author: "施耐庵",
    tagline: "从个人逼上梁山，到一百单八将聚义与离散。",
    genres: ["古典小说", "英雄", "江湖"],
    readingMinutes: 40,
    coverTone: "sand",
    status: "preparing",
  },
];

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
