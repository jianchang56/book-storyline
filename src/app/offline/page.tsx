import { BookOpen, RefreshCw } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "暂时离线",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center"
    >
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <BookOpen className="size-7" />
      </span>
      <p className="mt-7 text-sm font-medium tracking-[0.2em] text-primary">当前处于离线状态</p>
      <h1 className="mt-4 font-display text-4xl font-semibold">这页还没有保存到本地</h1>
      <p className="mt-5 max-w-lg leading-8 text-muted-foreground">
        已经打开过的书会自动保存在这台设备上。恢复网络后再访问一次，这本书就能离线阅读。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/shelf">
            <BookOpen />
            查看我的书架
          </Link>
        </Button>
        <Button asChild variant="outline">
          <a href="/">
            <RefreshCw />
            重新连接
          </a>
        </Button>
      </div>
    </main>
  );
}
