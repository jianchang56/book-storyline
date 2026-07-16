"use client";

import { HardDrive, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { type OfflineCacheStatus, sendServiceWorkerMessage } from "@/lib/service-worker-client";

export function OfflineStorageControls() {
  const [status, setStatus] = useState<OfflineCacheStatus | null>(null);
  const [usage, setUsage] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  const refresh = useCallback(async () => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }
    try {
      const [nextStatus, estimate] = await Promise.all([
        sendServiceWorkerMessage<OfflineCacheStatus>({ type: "GET_CACHE_STATUS" }),
        navigator.storage?.estimate(),
      ]);
      setStatus(nextStatus);
      setUsage(estimate?.usage ?? null);
    } catch {
      setStatus(null);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!status) {
    return null;
  }

  const megabytes = usage === null ? null : Math.max(0.1, usage / 1024 / 1024).toFixed(1);
  return (
    <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HardDrive className="size-5" />
        </span>
        <div>
          <h2 className="font-medium">离线内容</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            离线书架 {status.savedBooks} 本 · 最近阅读缓存 {status.recentBooks} 本（最多 8 本）
            {megabytes ? ` · 当前站点约占 ${megabytes} MB` : ""}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={clearing || (status.books === 0 && status.pages === 0)}
        onClick={() => {
          if (!window.confirm("确定清除全部离线图书和页面缓存吗？阅读进度与收藏不会删除。")) {
            return;
          }
          setClearing(true);
          void sendServiceWorkerMessage<OfflineCacheStatus>({ type: "CLEAR_OFFLINE" })
            .then(async (nextStatus) => {
              setStatus(nextStatus);
              window.dispatchEvent(new CustomEvent("storyline:offline-updated"));
              const estimate = await navigator.storage?.estimate();
              setUsage(estimate?.usage ?? null);
            })
            .catch(() => setStatus(null))
            .finally(() => {
              setClearing(false);
            });
        }}
      >
        <Trash2 />
        {clearing ? "正在清除…" : "清除离线内容"}
      </Button>
    </section>
  );
}
