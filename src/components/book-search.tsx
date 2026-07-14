import { Search, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BookSearchProps = {
  initialQuery?: string;
  resultCount: number;
};

export function BookSearch({ initialQuery = "", resultCount }: BookSearchProps) {
  return (
    <div>
      <form action="/books" className="mx-auto flex max-w-2xl gap-2 sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={initialQuery}
            placeholder="搜索书名、作者或题材"
            aria-label="搜索书名、作者或题材"
            className="h-14 bg-card pl-12 shadow-[0_16px_50px_-30px_rgba(20,35,40,0.35)]"
          />
        </div>
        <Button type="submit" className="h-14 px-5 sm:px-7">
          搜索
        </Button>
        {initialQuery ? (
          <Button asChild type="button" variant="outline" size="icon" className="size-14 shrink-0">
            <Link href="/books" aria-label="清空搜索">
              <X />
            </Link>
          </Button>
        ) : null}
      </form>

      <p className="mt-8 text-sm text-muted-foreground">找到 {resultCount} 本书</p>
    </div>
  );
}
