export type OfflineCacheStatus = {
  ok: boolean;
  books: number;
  recentBooks: number;
  savedBooks: number;
  savedSlugs: string[];
  assets: number;
  pages: number;
};

export async function sendServiceWorkerMessage<T>(message: unknown, timeoutMs = 15000) {
  if (!("serviceWorker" in navigator)) {
    throw new Error("service worker unavailable");
  }
  const registration = await navigator.serviceWorker.ready;
  const worker = registration.active;
  if (!worker) {
    throw new Error("service worker inactive");
  }

  return new Promise<T>((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = window.setTimeout(() => {
      channel.port1.close();
      reject(new Error("service worker response timed out"));
    }, timeoutMs);
    channel.port1.onmessage = (event: MessageEvent<T>) => {
      window.clearTimeout(timer);
      channel.port1.close();
      resolve(event.data);
    };
    worker.postMessage(message, [channel.port2]);
  });
}
