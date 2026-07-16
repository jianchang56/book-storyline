"use client";

import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 640;

export function ScrollToTop() {
  const pathname = usePathname();
  const [scrollState, setScrollState] = useState({ visible: false, progress: 0 });

  useEffect(() => {
    let animationFrame = 0;
    const update = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress =
          scrollableHeight > 0 ? Math.min(100, (window.scrollY / scrollableHeight) * 100) : 0;
        setScrollState({ visible: window.scrollY > SHOW_AFTER_PX, progress });
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  const isBookReader = pathname.startsWith("/books/");
  const roundedProgress = Math.round(scrollState.progress);

  return (
    <div
      className={cn(
        "fixed z-40 rounded-full p-0.5 shadow-xl transition-[opacity,transform] duration-200 motion-reduce:transition-none",
        isBookReader ? "right-3 bottom-24 md:hidden" : "right-4 bottom-5 sm:right-6 sm:bottom-6",
        scrollState.visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
      style={{
        background: `conic-gradient(var(--story-cinnabar) ${scrollState.progress}%, var(--border) ${scrollState.progress}%)`,
      }}
    >
      <button
        type="button"
        className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-background/95 text-foreground backdrop-blur-xl transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
        aria-label={`返回页面顶部，当前已浏览 ${roundedProgress}%`}
        title="返回顶部"
        onClick={() => {
          const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        }}
      >
        <ArrowUp className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
