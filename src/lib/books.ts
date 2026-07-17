import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { CoverTone } from "@/lib/catalog";

const contentDirectory = path.join(process.cwd(), "content");

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
  readingModes: Array<{
    id: "overview" | "journey" | "complete";
    file: string;
    title: string;
    readingMinutes: number;
  }>;
};

export type BookSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type StoryArc = {
  id: string;
  title: string;
  startChapter: number;
  endChapter: number;
  summary: string;
  paragraphs: string[];
};

export type Book = {
  metadata: BookMetadata;
  overview: BookSection;
  storyArcs: StoryArc[];
  chapters: BookSection[];
};

export type ReaderBook = Omit<Book, "metadata"> & {
  metadata: Pick<BookMetadata, "slug" | "title" | "chapterCount" | "readingModes">;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`metadata ${field} must be a non-empty string`);
  }
  return value;
}

function positiveInteger(value: unknown, field: string) {
  if (!Number.isInteger(value) || Number(value) < 1) {
    throw new TypeError(`metadata ${field} must be a positive integer`);
  }
  return Number(value);
}

export function parseBookMetadata(source: string): BookMetadata {
  const value: unknown = JSON.parse(source);
  if (!isRecord(value)) {
    throw new TypeError("metadata must be an object");
  }
  if (
    !Array.isArray(value.genres) ||
    value.genres.length === 0 ||
    value.genres.some((genre) => typeof genre !== "string" || !genre.trim())
  ) {
    throw new TypeError("metadata genres must be a non-empty string array");
  }
  if (!Array.isArray(value.readingModes) || value.readingModes.length !== 3) {
    throw new TypeError("metadata readingModes must contain three modes");
  }

  const expectedModeIds = ["overview", "journey", "complete"] as const;
  const readingModes = value.readingModes.map((mode, index) => {
    if (!isRecord(mode) || mode.id !== expectedModeIds[index]) {
      throw new TypeError("metadata readingModes must be ordered overview, journey, complete");
    }
    return {
      id: expectedModeIds[index],
      file: requiredString(mode.file, `readingModes[${index}].file`),
      title: requiredString(mode.title, `readingModes[${index}].title`),
      readingMinutes: positiveInteger(mode.readingMinutes, `readingModes[${index}].readingMinutes`),
    };
  });

  return {
    slug: requiredString(value.slug, "slug"),
    title: requiredString(value.title, "title"),
    author: requiredString(value.author, "author"),
    era: requiredString(value.era, "era"),
    subtitle: requiredString(value.subtitle, "subtitle"),
    description: requiredString(value.description, "description"),
    genres: value.genres,
    readingMinutes: positiveInteger(value.readingMinutes, "readingMinutes"),
    chapterCount: positiveInteger(value.chapterCount, "chapterCount"),
    coverTone: requiredString(value.coverTone, "coverTone") as CoverTone,
    publishedAt: requiredString(value.publishedAt, "publishedAt"),
    readingModes,
  };
}

function parseParagraphs(source: string) {
  return source
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

export function parseBookSection(source: string, fallbackTitle: string): BookSection {
  const normalized = source.replace(/\r\n/g, "\n").trim();
  const [firstLine = "", ...remainingLines] = normalized.split("\n");
  const hasHeading = /^#\s+/.test(firstLine);
  const title = hasHeading ? firstLine.replace(/^#\s+/, "").trim() : fallbackTitle;
  const body = (hasHeading ? remainingLines : normalized.split("\n")).join("\n").trim();
  const paragraphs = parseParagraphs(body);

  return { id: "", title, paragraphs };
}

export function parseStoryArcs(source: string): StoryArc[] {
  const normalized = source.replace(/\r\n/g, "\n").trim();
  const headingPattern =
    /^###\s+(.+?)\s+<!--\s*arc-id=([a-z0-9]+(?:-[a-z0-9]+)*)\s+start=(\d+)\s+end=(\d+)\s*-->\s*$/gm;
  const matches = [...normalized.matchAll(headingPattern)];

  return matches.map((match, index) => {
    const bodyStart = (match.index ?? 0) + match[0].length;
    const bodyEnd = matches[index + 1]?.index ?? normalized.length;
    const paragraphs = parseParagraphs(normalized.slice(bodyStart, bodyEnd));

    return {
      id: match[2],
      title: match[1].replace(/^\d+\s+/, "").trim(),
      startChapter: Number(match[3]),
      endChapter: Number(match[4]),
      summary: paragraphs.join(" "),
      paragraphs,
    };
  });
}

export function parseBookChapters(source: string): BookSection[] {
  const normalized = source.replace(/\r\n/g, "\n").trim();
  const matches = [...normalized.matchAll(/^##\s+(.+?)\s*$/gm)];

  return matches.map((match, index) => {
    const bodyStart = (match.index ?? 0) + match[0].length;
    const bodyEnd = matches[index + 1]?.index ?? normalized.length;

    return {
      id: `chapter-${index + 1}`,
      title: match[1].trim(),
      paragraphs: parseParagraphs(normalized.slice(bodyStart, bodyEnd)),
    };
  });
}

async function loadBook(slug: string): Promise<Book | null> {
  const directory = path.join(contentDirectory, slug);

  try {
    const [metadataSource, overviewSource, routeSource, completeSource] = await Promise.all([
      readFile(path.join(directory, "metadata.json"), "utf8"),
      readFile(path.join(directory, "00-overview.md"), "utf8"),
      readFile(path.join(directory, "10-route.md"), "utf8"),
      readFile(path.join(directory, "20-full.md"), "utf8"),
    ]);
    const metadata = parseBookMetadata(metadataSource);

    return {
      metadata,
      overview: {
        ...parseBookSection(overviewSource, "全书速览"),
        id: "overview",
      },
      storyArcs: parseStoryArcs(routeSource),
      chapters: parseBookChapters(completeSource),
    };
  } catch (error) {
    if (isRecord(error) && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export const getBook = cache(loadBook);

export function toReaderBook(book: Book): ReaderBook {
  return {
    metadata: {
      slug: book.metadata.slug,
      title: book.metadata.title,
      chapterCount: book.metadata.chapterCount,
      readingModes: book.metadata.readingModes,
    },
    overview: book.overview,
    storyArcs: book.storyArcs,
    chapters: book.chapters,
  };
}
