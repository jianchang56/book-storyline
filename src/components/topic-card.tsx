import { ArrowUpRight, LibraryBig } from "lucide-react";
import Link from "next/link";
import { type BookCollection, collectionPath } from "@/lib/collections";
import { cn } from "@/lib/utils";

export function TopicCard({
  collection,
  className,
}: {
  collection: BookCollection;
  className?: string;
}) {
  const sampleTitles = collection.books.slice(0, 3).map((book) => book.title);

  return (
    <Link
      href={collectionPath(collection.slug)}
      className={cn(
        "group relative flex min-h-64 snap-start flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card/75 p-6 shadow-[0_20px_60px_-46px_rgba(18,38,40,0.6)] transition-[transform,background-color] hover:-translate-y-1 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-7",
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-16 -right-12 size-40 rounded-full border border-primary/15" />
      <div className="pointer-events-none absolute -top-7 -right-4 size-28 rounded-full border border-primary/10" />
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LibraryBig className="size-5" />
        </span>
        <ArrowUpRight className="size-5 text-primary opacity-60 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-7 text-xs font-medium tracking-[0.18em] text-primary">
        {collection.eyebrow}
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold tracking-wide sm:text-3xl">
        {collection.title}
      </h2>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {collection.shortDescription}
      </p>
      <div className="mt-auto pt-7">
        <p className="line-clamp-1 text-xs text-muted-foreground">{sampleTitles.join(" · ")}</p>
        <p className="mt-2 font-mono text-xs text-primary">{collection.books.length} 本作品</p>
      </div>
    </Link>
  );
}
