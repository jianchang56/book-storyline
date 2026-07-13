import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { CoverTone } from "@/lib/catalog";

const booksDirectory = path.join(process.cwd(), "content", "books");

export type BookMetadata = {
  slug: string;
  title: string;
  author: string;
  era: string;
  subtitle: string;
  description: string;
  genres: string[];
  readingMinutes: number;
  chapterCount: number;
  coverTone: CoverTone;
  publishedAt: string;
};

export type BookSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type Book = {
  metadata: BookMetadata;
  overview: BookSection;
  chapters: BookSection[];
};

export function parseBookSection(source: string, fallbackTitle: string): BookSection {
  const normalized = source.replace(/\r\n/g, "\n").trim();
  const [firstLine = "", ...remainingLines] = normalized.split("\n");
  const hasHeading = /^#\s+/.test(firstLine);
  const title = hasHeading ? firstLine.replace(/^#\s+/, "").trim() : fallbackTitle;
  const body = (hasHeading ? remainingLines : normalized.split("\n")).join("\n").trim();
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
    .filter(Boolean);

  return { id: "", title, paragraphs };
}

export async function getBookSlugs() {
  const entries = await readdir(booksDirectory, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

export async function getBook(slug: string): Promise<Book | null> {
  const directory = path.join(booksDirectory, slug);

  try {
    const [metadataSource, overviewSource, chapterFiles] = await Promise.all([
      readFile(path.join(directory, "metadata.json"), "utf8"),
      readFile(path.join(directory, "overview.md"), "utf8"),
      readdir(path.join(directory, "chapters")),
    ]);
    const metadata = JSON.parse(metadataSource) as BookMetadata;
    const sortedChapterFiles = chapterFiles.filter((file) => file.endsWith(".md")).toSorted();
    const chapterSources = await Promise.all(
      sortedChapterFiles.map((file) => readFile(path.join(directory, "chapters", file), "utf8")),
    );

    return {
      metadata,
      overview: {
        ...parseBookSection(overviewSource, "全书速览"),
        id: "overview",
      },
      chapters: chapterSources.map((source, index) => ({
        ...parseBookSection(source, `第 ${index + 1} 章`),
        id: `chapter-${index + 1}`,
      })),
    };
  } catch {
    return null;
  }
}
