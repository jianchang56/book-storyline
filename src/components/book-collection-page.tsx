import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { BookCard } from "@/components/book-card";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import type { CatalogBook } from "@/lib/catalog";

type BookCollectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  backHref: ComponentProps<typeof Link>["href"];
  backLabel: string;
  books: CatalogBook[];
};

export function BookCollectionPage({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
  books,
}: BookCollectionPageProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      >
        <Button asChild variant="ghost" className="-ml-4">
          <Link href={backHref}>
            <ArrowLeft />
            {backLabel}
          </Link>
        </Button>
        <header className="mt-10 max-w-3xl">
          <p className="text-sm font-medium tracking-[0.2em] text-primary">{eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-wide sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{description}</p>
          <p className="mt-5 text-sm text-muted-foreground">共 {books.length} 本已发布作品</p>
        </header>
        <div className="mt-12 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {books.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      </main>
    </div>
  );
}
