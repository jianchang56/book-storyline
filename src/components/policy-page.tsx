import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

type PolicyPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt: string;
  sections: Array<{ title: string; paragraphs: string[] }>;
};

export function PolicyPage({ eyebrow, title, intro, updatedAt, sections }: PolicyPageProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      >
        <Button asChild variant="ghost" className="-ml-4">
          <Link href="/">
            <ArrowLeft />
            返回首页
          </Link>
        </Button>
        <header className="mt-10 border-b border-border pb-10">
          <p className="text-sm font-medium tracking-[0.2em] text-primary">{eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-wide sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{intro}</p>
          <p className="mt-5 text-sm text-muted-foreground">最近更新：{updatedAt}</p>
        </header>
        <div className="py-4">
          {sections.map((section) => (
            <section key={section.title} className="border-b border-border py-9 last:border-b-0">
              <h2 className="font-display text-2xl font-semibold">{section.title}</h2>
              <div className="mt-4 space-y-4 leading-8 text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
