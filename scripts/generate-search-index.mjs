// 生成全站全文搜索静态索引：扫描 content/<slug>/20-full.md，
// 输出 public/search-index.json（构建期由 prebuild 自动执行，新增书籍后必须重新生成）。
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const contentDir = join(root, "content");
const catalog = JSON.parse(readFileSync(join(contentDir, "catalog.json"), "utf-8"));

const books = {};
const chapters = [];

for (const book of catalog) {
  if (book.status !== "published") continue;
  const fullPath = join(contentDir, book.slug, "20-full.md");
  let markdown;
  try {
    markdown = readFileSync(fullPath, "utf-8");
  } catch {
    console.warn(`[search-index] 跳过缺少 20-full.md 的 ${book.slug}`);
    continue;
  }
  books[book.slug] = { t: book.title, a: book.author };

  // 按 H2 切分章节（H1 为第一行标题，其后每章一个 H2）
  const sections = markdown.split(/^## /m).slice(1);
  sections.forEach((section, index) => {
    const newlineAt = section.indexOf("\n");
    const heading = (newlineAt === -1 ? section : section.slice(0, newlineAt)).trim();
    const body = (newlineAt === -1 ? "" : section.slice(newlineAt + 1)).replace(/\s+/g, " ").trim();
    if (!heading || !body) return;
    chapters.push({ b: book.slug, c: index + 1, h: heading, x: body });
  });
}

const index = {
  v: 1,
  generatedAt: new Date().toISOString(),
  books,
  chapters,
};

mkdirSync(join(root, "public"), { recursive: true });
const outPath = join(root, "public", "search-index.json");
writeFileSync(outPath, JSON.stringify(index));
const stats = JSON.stringify(index).length;
console.log(
  `[search-index] ${Object.keys(books).length} 本书，${chapters.length} 章，${(stats / 1024 / 1024).toFixed(2)} MB -> ${outPath}`,
);
