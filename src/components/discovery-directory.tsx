import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

type DirectoryItem = {
  name: string;
  count: number;
  href: ComponentProps<typeof Link>["href"];
};

type DiscoveryDirectoryProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: DirectoryItem[];
  startIndex?: number;
  pagination?: {
    pathname: "/authors" | "/genres";
    page: number;
    totalPages: number;
    startNumber: number;
    endNumber: number;
    totalItems: number;
  };
};

export function DiscoveryDirectory({
  eyebrow,
  title,
  description,
  items,
  startIndex = 0,
  pagination,
}: DiscoveryDirectoryProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-20 lg:px-8"
      >
        <header className="max-w-3xl">
          <p className="text-sm font-medium tracking-[0.2em] text-primary">{eyebrow}</p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-wide sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {description}
          </p>
        </header>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex min-h-28 items-center justify-between gap-5 rounded-2xl border border-border bg-card/65 p-5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-32 sm:p-6"
            >
              <span>
                <span className="font-mono text-xs text-story-cinnabar">
                  {String(startIndex + index + 1).padStart(2, "0")}
                </span>
                <span className="mt-3 block font-display text-xl font-semibold sm:text-2xl">
                  {item.name}
                </span>
                <span className="mt-2 block text-sm text-muted-foreground">
                  {item.count} 本作品
                </span>
              </span>
              <ArrowUpRight className="size-5 shrink-0 text-primary opacity-60 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
        {pagination && pagination.totalPages > 1 ? (
          <nav
            aria-label={`${eyebrow}分页`}
            className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row"
          >
            <p className="text-sm text-muted-foreground">
              显示第 {pagination.startNumber}–{pagination.endNumber} 项，共 {pagination.totalItems}{" "}
              项
            </p>
            <div className="flex items-center gap-3">
              {pagination.page > 1 ? (
                <Button asChild variant="outline">
                  <Link
                    href={{
                      pathname: pagination.pathname,
                      query: pagination.page > 2 ? { page: pagination.page - 1 } : undefined,
                    }}
                  >
                    <ChevronLeft />
                    上一页
                  </Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" disabled>
                  <ChevronLeft />
                  上一页
                </Button>
              )}
              <span className="min-w-20 text-center font-mono text-sm text-muted-foreground">
                {pagination.page} / {pagination.totalPages}
              </span>
              {pagination.page < pagination.totalPages ? (
                <Button asChild variant="outline">
                  <Link
                    href={{
                      pathname: pagination.pathname,
                      query: { page: pagination.page + 1 },
                    }}
                  >
                    下一页
                    <ChevronRight />
                  </Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" disabled>
                  下一页
                  <ChevronRight />
                </Button>
              )}
            </div>
          </nav>
        ) : null}
      </main>
    </div>
  );
}
