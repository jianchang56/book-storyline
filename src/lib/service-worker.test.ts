import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

const origin = "https://storyline.test";
const workerSource = readFileSync(new URL("../../public/sw.js", import.meta.url), "utf8");

function requestUrl(input: RequestInfo | URL) {
  if (typeof input === "string") {
    return new URL(input, origin).href;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}

class MemoryCache {
  private entries = new Map<string, Response>();

  async match(input: RequestInfo | URL) {
    return this.entries.get(requestUrl(input))?.clone();
  }

  async put(input: RequestInfo | URL, response: Response) {
    this.entries.set(requestUrl(input), response.clone());
  }

  async delete(input: RequestInfo | URL) {
    return this.entries.delete(requestUrl(input));
  }

  async keys() {
    return [...this.entries.keys()].map((url) => new Request(url));
  }
}

class MemoryCacheStorage {
  stores = new Map<string, MemoryCache>();

  async open(name: string) {
    const existing = this.stores.get(name);
    if (existing) {
      return existing;
    }
    const cache = new MemoryCache();
    this.stores.set(name, cache);
    return cache;
  }

  async keys() {
    return [...this.stores.keys()];
  }

  async delete(name: string) {
    return this.stores.delete(name);
  }

  async match(input: RequestInfo | URL) {
    for (const cache of this.stores.values()) {
      const response = await cache.match(input);
      if (response) {
        return response;
      }
    }
    return undefined;
  }
}

type WorkerEventListener = (event: Record<string, unknown>) => void;

function createWorker() {
  const listeners = new Map<string, WorkerEventListener>();
  const caches = new MemoryCacheStorage();
  const claim = vi.fn(async () => undefined);
  const fetchMock = vi.fn<(request: Request) => Promise<Response>>();
  const self = {
    location: new URL(origin),
    clients: { claim },
    skipWaiting: vi.fn(),
    addEventListener: (type: string, listener: WorkerEventListener) => {
      listeners.set(type, listener);
    },
  };
  const context = vm.createContext({
    URL,
    Request,
    Response,
    Promise,
    Set,
    caches,
    fetch: fetchMock,
    self,
  });
  vm.runInContext(workerSource, context);
  return { caches, claim, context, fetchMock, listeners };
}

function htmlResponse(body: string) {
  return new Response(body, { headers: { "content-type": "text/html; charset=utf-8" } });
}

describe("service worker", () => {
  it("migrates saved books into a stable cache before deleting old versions", async () => {
    const worker = createWorker();
    const bookRequest = new Request(`${origin}/books/xiyouji`);
    await (await worker.caches.open("storyline-v4:saved-books")).put(
      bookRequest,
      htmlResponse("saved book"),
    );
    await worker.caches.open("storyline-v4:shell");

    let activation: Promise<unknown> | undefined;
    worker.listeners.get("activate")?.({
      waitUntil: (promise: Promise<unknown>) => {
        activation = promise;
      },
    });
    await activation;

    expect(
      await (await worker.caches.open("storyline-saved-books")).match(bookRequest),
    ).toBeDefined();
    expect(await worker.caches.keys()).not.toContain("storyline-v4:saved-books");
    expect(await worker.caches.keys()).not.toContain("storyline-v4:shell");
    expect(worker.claim).toHaveBeenCalledOnce();
  });

  it("moves a recently cached book into the persistent shelf", async () => {
    const worker = createWorker();
    const bookRequest = new Request(`${origin}/books/xiyouji`);
    const recent = await worker.caches.open("storyline-v5:recent-books");
    await recent.put(bookRequest, htmlResponse("recent book"));

    const cacheBook = worker.context.cacheBook as (
      url: string,
      savePermanently: boolean,
    ) => Promise<{ ok: boolean; saved?: boolean }>;
    const getCacheStatus = worker.context.getCacheStatus as () => Promise<{
      savedBooks: number;
      savedSlugs: string[];
    }>;

    await expect(cacheBook(bookRequest.url, true)).resolves.toMatchObject({
      ok: true,
      saved: true,
    });
    expect(await recent.match(bookRequest)).toBeUndefined();
    await expect(getCacheStatus()).resolves.toMatchObject({
      savedBooks: 1,
      savedSlugs: ["xiyouji"],
    });
  });

  it("returns cached HTML when an RSC navigation loses the network", async () => {
    const worker = createWorker();
    const bookRequest = new Request(`${origin}/books/xiyouji`);
    await (await worker.caches.open("storyline-saved-books")).put(
      bookRequest,
      htmlResponse("offline book"),
    );
    worker.fetchMock.mockRejectedValueOnce(new TypeError("network unavailable"));

    const rscRequest = new Request(`${origin}/books/xiyouji?_rsc=offline`, {
      headers: { RSC: "1" },
    });
    let response: Promise<Response> | undefined;
    worker.listeners.get("fetch")?.({
      request: rscRequest,
      respondWith: (promise: Promise<Response>) => {
        response = promise;
      },
      waitUntil: () => undefined,
    });

    const result = await response;
    expect(result?.headers.get("content-type")).toContain("text/html");
    await expect(result?.text()).resolves.toBe("offline book");
  });

  it("trims the oldest cache entries", async () => {
    const worker = createWorker();
    const cache = await worker.caches.open("test-cache");
    await cache.put(`${origin}/one`, htmlResponse("one"));
    await cache.put(`${origin}/two`, htmlResponse("two"));
    await cache.put(`${origin}/three`, htmlResponse("three"));
    const trimCache = worker.context.trimCache as (
      target: MemoryCache,
      maximum: number,
    ) => Promise<void>;

    await trimCache(cache, 2);

    expect((await cache.keys()).map((request) => request.url)).toEqual([
      `${origin}/two`,
      `${origin}/three`,
    ]);
  });
});
