import { GitFork, Search } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";
import { MobileSiteNav } from "@/components/mobile-site-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header
      data-site-header
      className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <LogoMark />
        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          <Button asChild variant="ghost">
            <Link href="/books">书库</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/collections">专题</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={{ pathname: "/authors" }}>作者</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={{ pathname: "/genres" }}>类型</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={{ pathname: "/about" }}>关于书脉</Link>
          </Button>
        </nav>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link href="/books" aria-label="搜索书籍">
              <Search />
            </Link>
          </Button>
          <MobileSiteNav />
          <Button asChild variant="ghost" size="icon" className="size-11">
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="在 GitHub 查看书脉项目"
              title="在 GitHub 查看项目"
            >
              <GitFork />
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
