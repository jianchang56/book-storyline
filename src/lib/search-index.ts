export type SearchIndexBook = { t: string; a: string };

export type SearchIndexChapter = { b: string; c: number; h: string; x: string };

export type SearchIndexData = {
  v: number;
  generatedAt: string;
  books: Record<string, SearchIndexBook>;
  chapters: SearchIndexChapter[];
};

export type ChapterSearchResult = {
  slug: string;
  chapter: number;
  heading: string;
  snippet: string;
  score: number;
};

export type BookSearchGroup = {
  slug: string;
  bookTitle: string;
  author: string;
  bestScore: number;
  chapters: ChapterSearchResult[];
};

const minQueryLength = 2;
const defaultGroupLimit = 8;
const chaptersPerGroup = 3;
const snippetRadius = 36;

function normalize(value: string): string {
  return value.toLocaleLowerCase("zh-CN");
}

function createSnippet(text: string, terms: string[]): string {
  const normalizedText = normalize(text);
  let firstAt = -1;
  for (const term of terms) {
    const at = normalizedText.indexOf(term);
    if (at !== -1 && (firstAt === -1 || at < firstAt)) {
      firstAt = at;
    }
  }
  if (firstAt === -1) {
    return text.length > snippetRadius * 2 ? `${text.slice(0, snippetRadius * 2)}…` : text;
  }
  const start = Math.max(0, firstAt - snippetRadius);
  const end = Math.min(text.length, firstAt + snippetRadius);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

/** 在静态索引中做全词 AND 匹配，按书分组返回章节级结果。 */
export function searchIndex(
  data: SearchIndexData,
  query: string,
  { groupLimit = defaultGroupLimit }: { groupLimit?: number } = {},
): BookSearchGroup[] {
  const trimmed = query.trim();
  if (trimmed.length < minQueryLength) {
    return [];
  }
  const terms = normalize(trimmed).split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return [];
  }
  const fullQuery = terms.join(" ");

  const groups = new Map<string, BookSearchGroup>();
  for (const chapter of data.chapters) {
    const book = data.books[chapter.b];
    if (!book) continue;
    const haystack = normalize(`${book.t} ${book.a} ${chapter.h} ${chapter.x}`);
    if (!terms.every((term) => haystack.includes(term))) {
      continue;
    }

    let score = 0;
    if (normalize(book.t).includes(fullQuery)) score += 100;
    if (normalize(book.a).includes(fullQuery)) score += 60;
    if (normalize(chapter.h).includes(fullQuery)) score += 40;
    for (const term of terms) {
      if (normalize(chapter.x).includes(term)) score += 5;
    }

    const result: ChapterSearchResult = {
      slug: chapter.b,
      chapter: chapter.c,
      heading: chapter.h,
      snippet: createSnippet(chapter.x, terms),
      score,
    };
    const group = groups.get(chapter.b) ?? {
      slug: chapter.b,
      bookTitle: book.t,
      author: book.a,
      bestScore: 0,
      chapters: [],
    };
    if (group.chapters.length < chaptersPerGroup) {
      group.chapters.push(result);
    }
    group.bestScore = Math.max(group.bestScore, score);
    groups.set(chapter.b, group);
  }

  return [...groups.values()]
    .toSorted(
      (a, b) => b.bestScore - a.bestScore || a.bookTitle.localeCompare(b.bookTitle, "zh-CN"),
    )
    .slice(0, groupLimit);
}
