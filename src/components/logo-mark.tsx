import Link from "next/link";

export function LogoMark() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="书脉首页"
    >
      <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-[0.8rem] shadow-sm transition-transform duration-200 group-hover:-rotate-2">
        <svg viewBox="0 0 64 64" className="size-9" aria-hidden="true">
          <rect width="64" height="64" rx="15" fill="var(--primary)" />
          <path
            d="M12 17.5c7.3-2.7 13.8-1.8 20 2.7v29c-6.2-4.5-12.7-5.4-20-2.7v-29Z"
            fill="var(--primary-foreground)"
          />
          <path
            d="M52 17.5c-7.3-2.7-13.8-1.8-20 2.7v29c6.2-4.5 12.7-5.4 20-2.7v-29Z"
            fill="var(--secondary)"
          />
          <path d="M32 20.2v29" stroke="var(--story-jade)" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M39 26.5h6.5v7H42v7h5.5"
            fill="none"
            stroke="var(--story-cinnabar)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="39" cy="26.5" r="3.4" fill="var(--story-cinnabar)" />
          <circle cx="47.5" cy="40.5" r="3.4" fill="var(--story-cinnabar)" />
        </svg>
      </span>
      <span className="font-display text-xl font-semibold tracking-[0.08em] text-foreground">
        书脉
      </span>
    </Link>
  );
}
