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
    tagline: "从石猴出世到五圣成真，一百回读完取经主线。",
    genres: ["古典小说", "神魔", "冒险"],
    readingMinutes: 60,
    coverTone: "cinnabar",
    status: "published",
  },
  {
    slug: "sanguoyanyi",
    title: "三国演义",
    author: "罗贯中",
    tagline: "从群雄并起到三分归晋，理清一百二十回兴亡脉络。",
    genres: ["古典小说", "历史", "战争"],
    readingMinutes: 120,
    coverTone: "indigo",
    status: "published",
  },
  {
    slug: "hongloumeng",
    title: "红楼梦",
    author: "曹雪芹",
    tagline: "沿人物关系与家族盛衰，读懂大观园里的情与命。",
    genres: ["古典小说", "世情", "家族"],
    readingMinutes: 150,
    coverTone: "plum",
    status: "published",
  },
  {
    slug: "shuihuzhuan",
    title: "水浒传",
    author: "施耐庵",
    tagline: "从个人逼上梁山，到一百单八将聚义与离散。",
    genres: ["古典小说", "英雄", "江湖"],
    readingMinutes: 120,
    coverTone: "sand",
    status: "published",
  },
  {
    slug: "biancheng",
    title: "边城",
    author: "沈从文",
    tagline: "茶峒渡口的一段朦胧情感与无尽等待。",
    genres: ["现代小说", "乡土", "爱情"],
    readingMinutes: 15,
    coverTone: "jade",
    status: "published",
  },
  {
    slug: "laorenyuhai",
    title: "老人与海",
    author: "海明威",
    tagline: "一个老人、一条大鱼与一片大海的独自搏斗。",
    genres: ["外国文学", "小说", "经典"],
    readingMinutes: 10,
    coverTone: "indigo",
    status: "published",
  },
  {
    slug: "tangjihde",
    title: "堂吉诃德",
    author: "塞万提斯",
    tagline: "把风车当巨人、客店当城堡的骑士末路。",
    genres: ["外国文学", "小说", "经典"],
    readingMinutes: 120,
    coverTone: "indigo",
    status: "published",
  },
  {
    slug: "weicheng",
    title: "围城",
    author: "钱锺书",
    tagline: "文凭、情场与婚姻，样样都是困人的城。",
    genres: ["现代小说", "讽刺", "爱情"],
    readingMinutes: 15,
    coverTone: "plum",
    status: "published",
  },
  {
    slug: "balishumuyuan",
    title: "巴黎圣母院",
    author: "雨果",
    tagline: "圣母院钟楼里的一段美与罪的纠葛。",
    genres: ["外国文学", "小说", "经典"],
    readingMinutes: 10,
    coverTone: "cinnabar",
    status: "published",
  },
  {
    slug: "daweikebofeier",
    title: "大卫·科波菲尔",
    author: "狄更斯",
    tagline: "一个男孩的成长、漂泊与最终归宿。",
    genres: ["外国文学", "小说", "成长"],
    readingMinutes: 60,
    coverTone: "sand",
    status: "published",
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
