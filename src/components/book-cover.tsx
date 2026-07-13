import type { CoverTone } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const toneClasses: Record<CoverTone, string> = {
  cinnabar: "from-[#bf5b43] via-[#d97958] to-[#e6a36f] text-[#fffaf2]",
  indigo: "from-[#263b57] via-[#315675] to-[#5c7d91] text-[#f4f8fa]",
  jade: "from-[#245c59] via-[#3d7770] to-[#86a696] text-[#f5fbf7]",
  plum: "from-[#56374b] via-[#80516d] to-[#aa7d8d] text-[#fff8fb]",
  sand: "from-[#836b45] via-[#ac8d5f] to-[#d4bd8c] text-[#fffaf0]",
};

type BookCoverProps = {
  title: string;
  author: string;
  tone: CoverTone;
  className?: string;
};

export function BookCover({ title, author, tone, className }: BookCoverProps) {
  return (
    <div
      className={cn(
        "book-cover relative isolate aspect-[3/4.2] overflow-hidden rounded-r-md rounded-l-[0.8rem] bg-gradient-to-br shadow-[0_22px_50px_-24px_rgba(21,30,35,0.55)]",
        toneClasses[tone],
        className,
      )}
      aria-label={`《${title}》封面`}
      role="img"
    >
      <div className="absolute inset-y-0 left-0 w-3 border-r border-white/20 bg-black/10" />
      <div className="absolute inset-3 rounded-[0.55rem] border border-white/25" />
      <div className="absolute top-6 right-5 text-[10px] tracking-[0.3em] opacity-70 [writing-mode:vertical-rl]">
        故事梗概
      </div>
      <div className="absolute right-5 bottom-6 left-7">
        <p className="font-display text-[clamp(1.5rem,4vw,2.5rem)] leading-[1.15] font-semibold tracking-[0.12em] [text-wrap:balance]">
          {title}
        </p>
        <div className="mt-4 h-px w-10 bg-current opacity-50" />
        <p className="mt-3 text-xs tracking-[0.2em] opacity-80">{author}</p>
      </div>
      <div className="absolute -top-12 -left-12 size-40 rounded-full border border-white/15" />
      <div className="absolute -top-6 -left-6 size-28 rounded-full border border-white/15" />
    </div>
  );
}
