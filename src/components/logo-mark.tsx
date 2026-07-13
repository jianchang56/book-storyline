import { BookOpenText } from "lucide-react";
import Link from "next/link";

export function LogoMark() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="故事线首页"
    >
      <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-[0.8rem] bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:-rotate-2">
        <BookOpenText className="size-5" strokeWidth={1.8} />
        <span className="absolute right-1 bottom-1 size-1.5 rounded-full bg-story-cinnabar" />
      </span>
      <span className="font-display text-xl font-semibold tracking-[0.08em] text-foreground">
        故事线
      </span>
    </Link>
  );
}
