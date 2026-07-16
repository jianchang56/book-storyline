import type { CoverTone } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const toneClasses: Record<CoverTone, string> = {
  amber: "from-[#895a2c] via-[#b67a39] to-[#d9aa62] text-[#fffaf0]",
  charcoal: "from-[#38444d] via-[#596970] to-[#8a9795] text-[#f8fbfa]",
  cinnabar: "from-[#bf5b43] via-[#d97958] to-[#e6a36f] text-[#fffaf2]",
  forest: "from-[#285145] via-[#49745b] to-[#88a47a] text-[#f7fff8]",
  heather: "from-[#59445f] via-[#80617c] to-[#b08c9b] text-[#fff8fc]",
  indigo: "from-[#263b57] via-[#315675] to-[#5c7d91] text-[#f4f8fa]",
  ivory: "from-[#bfa772] via-[#dac794] to-[#eee1ba] text-[#302a20]",
  jade: "from-[#245c59] via-[#3d7770] to-[#86a696] text-[#f5fbf7]",
  lilac: "from-[#66517a] via-[#8b70a0] to-[#b8a0c5] text-[#fff9ff]",
  midnight: "from-[#182c4d] via-[#294f78] to-[#557ea0] text-[#f5f9ff]",
  ocean: "from-[#12566b] via-[#24798a] to-[#69a9a6] text-[#f3ffff]",
  ochre: "from-[#80601f] via-[#ad812d] to-[#d2aa58] text-[#fffbed]",
  plum: "from-[#56374b] via-[#80516d] to-[#aa7d8d] text-[#fff8fb]",
  rose: "from-[#844c62] via-[#ad6678] to-[#d79a9e] text-[#fff8f8]",
  sage: "from-[#48644f] via-[#708769] to-[#a9b28a] text-[#fbfff6]",
  sand: "from-[#836b45] via-[#ac8d5f] to-[#d4bd8c] text-[#fffaf0]",
  slate: "from-[#3f5264] via-[#62788a] to-[#94a6ad] text-[#f7fbfc]",
  steel: "from-[#344b5b] via-[#527080] to-[#8ca0a5] text-[#f7fbfc]",
  stone: "from-[#665d48] via-[#8a8062] to-[#b6aa82] text-[#fffdf4]",
  sunset: "from-[#a94f4c] via-[#d47059] to-[#e9aa78] text-[#fff9f3]",
  teal: "from-[#18565a] via-[#28777a] to-[#6ba2a0] text-[#f3ffff]",
};

type BookCoverProps = {
  title: string;
  author: string;
  tone: CoverTone;
  era: string;
  genres: string[];
  chapterCount: number;
  className?: string;
};

type CoverMotif =
  | "ascent"
  | "constellation"
  | "fracture"
  | "horizon"
  | "intertwine"
  | "route"
  | "rings"
  | "trinity";

const genreMotifs: Array<[Set<string>, CoverMotif]> = [
  [new Set(["神魔", "史诗", "宗教文学", "幻想"]), "constellation"],
  [new Set(["冒险", "江湖", "成长"]), "route"],
  [new Set(["历史", "战争", "革命文学"]), "trinity"],
  [new Set(["爱情", "家庭", "家族", "世情"]), "intertwine"],
  [new Set(["悲剧", "心理", "存在主义", "复仇", "哥特"]), "fracture"],
  [new Set(["哲学", "散文", "自然", "非虚构"]), "horizon"],
  [new Set(["自传", "励志", "青春"]), "ascent"],
];

function getMotif(genres: string[]) {
  return (
    genreMotifs.find(([candidates]) => genres.some((genre) => candidates.has(genre)))?.[1] ??
    "rings"
  );
}

function getLayout(era: string) {
  if (/古典|西汉|明|清|元|文艺复兴|13-14世纪/.test(era)) {
    return "classical";
  }
  if (/现代|当代|20世纪|19\d{2}|苏联|中国近现代/.test(era)) {
    return "modern";
  }
  return "heritage";
}

function CoverEmblem({ motif }: { motif: CoverMotif }) {
  const shared = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeWidth: 1.4,
  };
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
      {motif === "route" ? (
        <>
          <path {...shared} d="M14 77C28 62 19 43 42 41s20-22 43-25" />
          <circle cx="14" cy="77" r="3" fill="currentColor" />
          <circle cx="43" cy="41" r="2.5" fill="currentColor" />
          <circle cx="85" cy="16" r="3" fill="currentColor" />
        </>
      ) : null}
      {motif === "constellation" ? (
        <>
          <path {...shared} d="M18 69 35 35l24 13 23-29M35 35l8 42 16-29 20 27" />
          {["18,69", "35,35", "43,77", "59,48", "79,75", "82,19"].map((point) => {
            const [cx, cy] = point.split(",");
            return <circle key={point} cx={cx} cy={cy} r="2.7" fill="currentColor" />;
          })}
        </>
      ) : null}
      {motif === "trinity" ? (
        <>
          <path {...shared} d="M16 22c18 8 22 21 34 56M84 22C66 30 62 43 50 78M50 13v65" />
          <circle cx="50" cy="78" r="4" fill="currentColor" />
        </>
      ) : null}
      {motif === "intertwine" ? (
        <>
          <path {...shared} d="M19 18c42 13 20 49 62 64M81 18C39 31 61 67 19 82" />
          <circle cx="50" cy="50" r="4" fill="currentColor" />
        </>
      ) : null}
      {motif === "fracture" ? (
        <>
          <path {...shared} d="m53 11-9 25 12 9-17 19 9 7-8 19" />
          <path {...shared} d="M20 31h21M58 69h22" opacity=".55" />
        </>
      ) : null}
      {motif === "horizon" ? (
        <>
          <path {...shared} d="M13 70h74M23 70a27 27 0 0 1 54 0M34 70a16 16 0 0 1 32 0" />
          <circle cx="50" cy="70" r="3" fill="currentColor" />
        </>
      ) : null}
      {motif === "ascent" ? (
        <>
          <path {...shared} d="M17 79h18V61h17V43h17V25h15" />
          <path {...shared} d="m75 16 9 9-9 9" />
        </>
      ) : null}
      {motif === "rings" ? (
        <>
          <circle {...shared} cx="50" cy="50" r="34" />
          <circle {...shared} cx="50" cy="50" r="21" />
          <circle cx="50" cy="50" r="4" fill="currentColor" />
        </>
      ) : null}
    </svg>
  );
}

export function BookCover({
  title,
  author,
  tone,
  era,
  genres,
  chapterCount,
  className,
}: BookCoverProps) {
  const titleLength = Array.from(title.trim()).length;
  const layout = getLayout(era);
  const motif = getMotif(genres);
  const titleTypography =
    titleLength >= 7
      ? "text-[clamp(1.05rem,10cqw,1.42rem)] leading-[1.18] tracking-[0.045em]"
      : titleLength >= 5
        ? "text-[clamp(1.25rem,13cqw,1.72rem)] leading-[1.18] tracking-[0.07em]"
        : "text-[clamp(1.5rem,18cqw,2.15rem)] leading-[1.16] tracking-[0.1em]";

  return (
    <div
      className={cn(
        "book-cover relative isolate aspect-[3/4.2] overflow-hidden rounded-r-md rounded-l-[0.8rem] bg-gradient-to-br shadow-[0_22px_50px_-24px_rgba(21,30,35,0.55)] [container-type:inline-size]",
        toneClasses[tone],
        className,
      )}
      aria-label={`《${title}》封面`}
      role="img"
    >
      <div className="absolute inset-y-0 left-0 w-3 border-r border-current/20 bg-black/10">
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-medium tracking-[0.08em] opacity-70 [writing-mode:vertical-rl]">
          {chapterCount} 回
        </span>
      </div>
      <div className="absolute inset-3 rounded-[0.55rem] border border-white/25" />
      <div className="absolute top-5 right-5 text-[8px] tracking-[0.24em] opacity-65 [writing-mode:vertical-rl]">
        故事梗概
      </div>
      <div className="absolute top-5 left-6 text-[8px] tracking-[0.18em] opacity-55">
        书脉 · 故事档案
      </div>
      <div
        className={cn(
          "absolute opacity-[0.22]",
          layout === "classical"
            ? "top-[18%] left-[18%] size-[58%]"
            : layout === "modern"
              ? "top-[12%] right-[12%] size-[52%]"
              : "top-[17%] left-[24%] size-[54%]",
        )}
      >
        <CoverEmblem motif={motif} />
      </div>
      <div
        className={cn(
          "absolute right-12 left-7",
          layout === "classical"
            ? "top-[46%] -translate-y-1/2 text-right"
            : layout === "modern"
              ? "top-[47%]"
              : "top-[47%] -translate-y-1/2 text-center",
        )}
      >
        <p
          className={cn(
            "font-display font-semibold [text-wrap:balance]",
            titleTypography,
            layout === "modern" ? "border-l border-current/45 pl-3" : "",
          )}
        >
          {title}
        </p>
      </div>
      <div className="absolute right-5 bottom-6 left-7">
        <div className="mt-4 h-px w-10 bg-current opacity-50" />
        <p className="mt-3 text-xs tracking-[0.2em] opacity-80">{author}</p>
      </div>
      <div className="absolute right-4 bottom-4 size-10 border-r border-b border-current/20" />
    </div>
  );
}
