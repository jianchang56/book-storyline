import { readFile } from "node:fs/promises";
import path from "node:path";
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
};

export type Book = {
  metadata: BookMetadata;
  overview: BookSection;
  storyArcs: StoryArc[];
  chapters: BookSection[];
};

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
    const summary = parseParagraphs(normalized.slice(bodyStart, bodyEnd)).join(" ");

    return {
      id: match[2],
      title: match[1].replace(/^\d+\s+/, "").trim(),
      startChapter: Number(match[3]),
      endChapter: Number(match[4]),
      summary,
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

export async function getBook(slug: string): Promise<Book | null> {
  const directory = path.join(contentDirectory, slug);

  try {
    const [metadataSource, overviewSource, routeSource, completeSource] = await Promise.all([
      readFile(path.join(directory, "metadata.json"), "utf8"),
      readFile(path.join(directory, "00-overview.md"), "utf8"),
      readFile(path.join(directory, "10-route.md"), "utf8"),
      readFile(path.join(directory, "20-full.md"), "utf8"),
    ]);
    const metadata = JSON.parse(metadataSource) as BookMetadata;

    return {
      metadata,
      overview: {
        ...parseBookSection(overviewSource, "全书速览"),
        id: "overview",
      },
      storyArcs: parseStoryArcs(routeSource),
      chapters: parseBookChapters(completeSource),
    };
  } catch {
    return null;
  }
}
