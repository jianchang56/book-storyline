import { Search } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <LogoMark />
        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          <Button asChild variant="ghost">
            <Link href="/books">书库</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/#about">关于故事线</Link>
          </Button>
        </nav>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link href="/books" aria-label="搜索书籍">
              <Search />
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
