import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center px-4"
    >
      <div className="max-w-lg text-center">
        <p className="font-mono text-sm text-story-cinnabar">404</p>
        <h1 className="mt-5 font-display text-4xl font-semibold">这条故事线还没写到这里</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          返回书库，选择一本已经整理完成的作品。
        </p>
        <Button asChild className="mt-8">
          <Link href="/books">返回书库</Link>
        </Button>
      </div>
    </main>
  );
}
