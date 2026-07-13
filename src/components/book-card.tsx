import { ArrowUpRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { BookCover } from "@/components/book-cover";
import { Badge } from "@/components/ui/badge";
import type { CatalogBook } from "@/lib/catalog";

export function BookCard({ book }: { book: CatalogBook }) {
  const content = (
    <>
      <BookCover
        title={book.title}
        author={book.author}
        tone={book.coverTone}
        className="w-full transition-transform duration-300 group-hover:-translate-y-1"
      />
      <div className="mt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold tracking-wide">{book.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
          </div>
          {book.status === "published" ? (
            <ArrowUpRight className="mt-1 size-5 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
          ) : (
            <Badge variant="outline">筹备中</Badge>
          )}
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{book.tagline}</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="size-3.5" />约 {book.readingMinutes} 分钟
        </div>
      </div>
    </>
  );

  if (book.status === "published") {
    return (
      <Link
        href="/books/xiyouji"
        className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        {content}
      </Link>
    );
  }

  return <article className="group opacity-75">{content}</article>;
}
