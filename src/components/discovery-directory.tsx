import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { SiteHeader } from "@/components/site-header";

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
};

export function DiscoveryDirectory({
  eyebrow,
  title,
  description,
  items,
}: DiscoveryDirectoryProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <header className="max-w-3xl">
          <p className="text-sm font-medium tracking-[0.2em] text-primary">{eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-wide sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{description}</p>
        </header>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex min-h-32 items-center justify-between gap-5 rounded-2xl border border-border bg-card/65 p-6 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>
                <span className="font-mono text-xs text-story-cinnabar">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-3 block font-display text-2xl font-semibold">{item.name}</span>
                <span className="mt-2 block text-sm text-muted-foreground">
                  {item.count} 本作品
                </span>
              </span>
              <ArrowUpRight className="size-5 shrink-0 text-primary opacity-60 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
