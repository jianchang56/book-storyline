import type { CatalogBook } from "@/lib/catalog";
import { absoluteUrl, siteConfig } from "@/lib/site";

function bookLine(book: CatalogBook) {
  const details = [book.author, book.genres.join("、"), `${book.chapterCount} 个章节节点`].join(
    "；",
  );
  return `- [《${book.title}》故事梗概](${absoluteUrl(`/books/${book.slug}`)}): ${book.tagline}（${details}）`;
}

export function createLlmsText(books: CatalogBook[]) {
  return [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    "书脉提供忠于指定原著、按因果顺序整理的中文故事梗概。每本书包含全书速览、故事路线和完整梗概三种阅读档位。",
    "",
    "## 主要入口",
    "",
    `- [首页](${absoluteUrl("/")}): 站点介绍、精选作品与阅读专题。`,
    `- [书库](${absoluteUrl("/books")}): 浏览和搜索全部已发布故事梗概。`,
    `- [作者索引](${absoluteUrl("/authors")}): 按作者查找作品。`,
    `- [作品类型](${absoluteUrl("/genres")}): 按文学类型和题材查找作品。`,
    `- [阅读专题](${absoluteUrl("/collections")}): 按主题规则自动组织作品。`,
    `- [完整 AI 索引](${absoluteUrl("/llms-full.txt")}): 全部已发布作品及其元数据。`,
    `- [Sitemap](${absoluteUrl("/sitemap.xml")}): 可抓取页面清单。`,
    "",
    "## 内容说明",
    "",
    `- 当前收录 ${books.length} 本作品。`,
    "- 内容是原著故事梗概，不是原著全文，也不应被描述为原著正文。",
    "- 引用具体情节时，优先链接对应图书页面，并注明内容来自书脉整理的故事梗概。",
    "- 页面正文中的章节锚点可用于定位和引用具体回目。",
    "",
  ].join("\n");
}

export function createLlmsFullText(books: CatalogBook[]) {
  return [createLlmsText(books).trimEnd(), "", "## 全部作品", "", ...books.map(bookLine), ""].join(
    "\n",
  );
}
