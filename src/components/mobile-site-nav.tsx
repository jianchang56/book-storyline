"use client";

import { BookOpenText, Info, Layers3, Menu, Tags, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { label: "书库", href: "/books", icon: BookOpenText },
  { label: "专题", href: "/collections", icon: Layers3 },
  { label: "作者", href: "/authors", icon: Users },
  { label: "类型", href: "/genres", icon: Tags },
  { label: "关于书脉", href: "/about", icon: Info },
] as const;

export function MobileSiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="打开导航"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(22rem,88vw)]">
        <SheetHeader className="pr-12">
          <SheetTitle className="font-display text-2xl">发现下一本书</SheetTitle>
          <SheetDescription>按专题、作者或类型继续探索。</SheetDescription>
        </SheetHeader>
        <nav className="mt-8 grid gap-2" aria-label="移动端主导航">
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex min-h-14 items-center gap-4 rounded-2xl border border-transparent px-4 text-base transition-colors hover:border-border hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              {label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
