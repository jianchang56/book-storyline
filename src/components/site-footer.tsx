import Link from "next/link";

const linkGroups = [
  {
    title: "发现",
    links: [
      ["书库", "/books"],
      ["专题", "/collections"],
      ["作者", "/authors"],
      ["类型", "/genres"],
    ],
  },
  {
    title: "书脉",
    links: [
      ["关于书脉", "/about"],
      ["纠错反馈", "/feedback"],
    ],
  },
  {
    title: "规则",
    links: [
      ["隐私政策", "/privacy"],
      ["使用条款", "/terms"],
      ["版权说明", "/copyright"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/35">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr] lg:px-8">
        <div>
          <p className="font-display text-2xl font-semibold tracking-wide">书脉</p>
          <p className="mt-4 max-w-md leading-7 text-muted-foreground">
            沿原著故事主线整理人物选择、关键转折与结果，让读者按适合自己的深度连续阅读。
          </p>
          <p className="mt-6 text-sm text-muted-foreground">© {new Date().getFullYear()} 书脉</p>
        </div>
        <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3" aria-label="页脚导航">
          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-medium">{group.title}</p>
              <div className="mt-3 flex flex-col">
                {group.links.map(([label, href]) => (
                  <Link
                    key={href}
                    href={{ pathname: href }}
                    className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
