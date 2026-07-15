import { BookMarked, BookOpenText, Info, Layers3, Menu, Tags, Users } from "lucide-react";
import Link from "next/link";

const links = [
  { label: "我的书架", href: "/shelf", icon: BookMarked },
  { label: "书库", href: "/books", icon: BookOpenText },
  { label: "专题", href: "/collections", icon: Layers3 },
  { label: "作者", href: "/authors", icon: Users },
  { label: "类型", href: "/genres", icon: Tags },
  { label: "关于书脉", href: "/about", icon: Info },
] as const;

export function MobileSiteNav() {
  return (
    <details className="group relative md:hidden">
      <summary
        className="flex size-11 cursor-pointer list-none items-center justify-center rounded-md text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
        aria-label="打开导航"
      >
        <Menu className="size-5 group-open:hidden" />
        <span className="hidden text-lg leading-none group-open:inline" aria-hidden="true">
          ×
        </span>
      </summary>
      <div className="absolute top-[calc(100%+0.75rem)] right-0 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-border bg-background/95 p-3 shadow-2xl backdrop-blur-xl">
        <div className="px-3 py-3">
          <p className="font-display text-xl font-semibold">发现下一本书</p>
          <p className="mt-1 text-sm text-muted-foreground">按专题、作者或类型继续探索。</p>
        </div>
        <nav className="grid gap-1" aria-label="移动端主导航">
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-14 items-center gap-4 rounded-2xl px-3 text-base transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </details>
  );
}
