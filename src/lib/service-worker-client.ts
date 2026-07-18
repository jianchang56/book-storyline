export type OfflineCacheStatus = {
  ok: boolean;
  books: number;
  recentBooks: number;
  savedBooks: number;
  savedSlugs: string[];
  assets: number;
  pages: number;
};

export function sendServiceWorkerMessage<T>(message: unknown, timeoutMs = 15000) {
  if (!("serviceWorker" in navigator)) {
    return Promise.reject(new Error("service worker unavailable"));
  }

  return new Promise<T>((resolve, reject) => {
    let channel: MessageChannel | null = null;
    let settled = false;
    const timer = window.setTimeout(() => {
      settled = true;
      channel?.port1.close();
      reject(new Error("service worker response timed out"));
    }, timeoutMs);

    void navigator.serviceWorker.ready.then(
      (registration) => {
        if (settled) {
          return;
        }
        const worker = registration.active;
        if (!worker) {
          window.clearTimeout(timer);
          settled = true;
          reject(new Error("service worker inactive"));
          return;
        }

        channel = new MessageChannel();
        channel.port1.onmessage = (event: MessageEvent<T>) => {
          if (settled) {
            return;
          }
          window.clearTimeout(timer);
          settled = true;
          channel?.port1.close();
          resolve(event.data);
        };
        worker.postMessage(message, [channel.port2]);
      },
      (error: unknown) => {
        if (settled) {
          return;
        }
        window.clearTimeout(timer);
        settled = true;
        reject(error);
      },
    );
  });
}
