"use client";

import { RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function PwaRegistration() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }

    let refreshing = false;
    const handleControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    const handleLocalFirstNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || !navigator.serviceWorker.controller) {
        return;
      }
      const target = event.target;
      const anchor =
        target instanceof Element ? target.closest<HTMLAnchorElement>("a[href]") : null;
      if (
        !anchor ||
        anchor.target ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) {
        return;
      }
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }
      if (navigator.onLine) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(url);
    };
    document.addEventListener("click", handleLocalFirstNavigation, { capture: true });

    void navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
        }
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(worker);
            }
          });
        });
        const assetUrls = performance
          .getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((url) => url.startsWith(`${window.location.origin}/_next/static/`));
        void navigator.serviceWorker.ready.then((readyRegistration) => {
          readyRegistration.active?.postMessage({ type: "CACHE_ASSETS", urls: assetUrls });
        });
      })
      .catch(() => {
        // The site remains fully usable online when service worker registration is unavailable.
      });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      document.removeEventListener("click", handleLocalFirstNavigation, { capture: true });
    };
  }, []);

  if (!waitingWorker) {
    return null;
  }

  return (
    <aside className="fixed right-4 bottom-24 left-4 z-[70] mx-auto max-w-md rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur-xl md:right-6 md:bottom-6 md:left-auto">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <RefreshCw className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">书脉有新版本</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            更新后会重新加载页面，阅读进度不会丢失。
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={() => waitingWorker.postMessage({ type: "SKIP_WAITING" })}
          >
            立即更新
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label="暂不更新"
          onClick={() => setWaitingWorker(null)}
        >
          <X />
        </Button>
      </div>
    </aside>
  );
}
