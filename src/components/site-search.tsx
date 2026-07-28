"use client";

import { BookOpenText, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type SearchIndexData, searchIndex } from "@/lib/search-index";

const indexUrl = "/search-index.json";

type LoadState = "idle" | "loading" | "ready" | "error";

export function SiteSearch() {
  const [query, setQuery] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [data, setData] = useState<SearchIndexData | null>(null);
  const loadingRef = useRef(false);

  // 首次输入时才下载索引（约 2MB，一次性加载后由 Service Worker 缓存）
  const ensureIndex = () => {
    if (loadingRef.current || data) {
      return;
    }
    loadingRef.current = true;
    setLoadState("loading");
    fetch(indexUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`加载索引失败：${response.status}`);
        }
        return response.json() as Promise<SearchIndexData>;
      })
      .then((index) => {
        setData(index);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  };

  const groups = useMemo(
    () => (data && query.trim().length >= 2 ? searchIndex(data, query) : []),
    [data, query],
  );
  const matchCount = groups.reduce((total, group) => total + group.chapters.length, 0);

  return (
    <div>
      <div className="mx-auto flex max-w-2xl gap-2 sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={ensureIndex}
            placeholder="试试书名、作者、人物或情节关键词"
            aria-label="全站搜索：书名、作者、人物或情节关键词"
            autoComplete="off"
            className="h-14 bg-card pl-12 shadow-[0_16px_50px_-30px_rgba(20,35,40,0.35)]"
          />
        </div>
        {query ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-14 shrink-0"
            onClick={() => setQuery("")}
            aria-label="清空搜索"
          >
            <X />
          </Button>
        ) : null}
      </div>

      <div aria-live="polite" className="mt-8">
        {loadState === "loading" ? (
          <p className="text-center text-sm text-muted-foreground">
            正在加载搜索索引（约 5 MB，仅在首次搜索时下载）……
          </p>
        ) : null}
        {loadState === "error" ? (
          <p className="text-center text-sm text-muted-foreground">
            搜索索引加载失败，请检查网络后重试。
          </p>
        ) : null}
        {loadState === "ready" && query.trim().length >= 2 ? (
          <p className="text-sm text-muted-foreground">
            {matchCount > 0
              ? `在 ${groups.length} 本书中找到 ${matchCount} 处匹配`
              : "没有找到匹配的内容，换个关键词试试。"}
          </p>
        ) : null}
        {loadState !== "loading" && query.trim().length < 2 ? (
          <p className="text-center text-sm text-muted-foreground">
            输入至少两个字开始搜索，例如「于连」「尼摩船长」「桃源」。
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-10">
        {groups.map((group) => (
          <section key={group.slug} aria-label={`《${group.bookTitle}》的匹配结果`}>
            <h2 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Link
                href={`/books/${group.slug}`}
                className="inline-flex min-h-11 items-center rounded-md font-display text-2xl font-semibold tracking-wide hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {group.bookTitle}
              </Link>
              <span className="text-sm text-muted-foreground">{group.author}</span>
            </h2>
            <ul className="mt-3 divide-y divide-border/70 border-y border-border/70">
              {group.chapters.map((chapter) => (
                <li key={`${chapter.slug}-${chapter.chapter}`}>
                  <Link
                    href={{
                      pathname: `/books/${chapter.slug}`,
                      hash: `chapter-${chapter.chapter}`,
                    }}
                    className="flex min-h-11 items-start gap-3 px-2 py-4 transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <BookOpenText className="mt-1 size-4 shrink-0 text-primary" />
                    <span>
                      <span className="text-sm font-medium">
                        {chapter.heading ? `${chapter.heading}` : `第 ${chapter.chapter} 章`}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                        {chapter.snippet}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
