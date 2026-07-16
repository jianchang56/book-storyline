import type { Metadata } from "next";
import { OfflineStorageControls } from "@/components/offline-storage-controls";
import { PersonalShelf } from "@/components/personal-shelf";
import { SiteHeader } from "@/components/site-header";
import { catalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "我的书架",
  description: "查看保存在当前设备上的阅读进度、收藏回目和已读作品。",
  robots: { index: false, follow: false },
};

export default function ShelfPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8"
      >
        <header className="max-w-3xl">
          <p className="text-sm font-medium tracking-[0.2em] text-primary">只属于这台设备</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-wide sm:text-5xl">
            我的书架
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            不需要账号。阅读进度、收藏与已读状态保存在浏览器中，清除网站数据后也会随之删除。
          </p>
        </header>
        <OfflineStorageControls />
        <PersonalShelf books={catalog} />
      </main>
    </div>
  );
}
