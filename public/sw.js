const CACHE_VERSION = "storyline-v2";
const SHELL_CACHE = `${CACHE_VERSION}:shell`;
const BOOK_CACHE = `${CACHE_VERSION}:books`;
const ASSET_CACHE = `${CACHE_VERSION}:assets`;
const RUNTIME_CACHE = `${CACHE_VERSION}:runtime`;
const CACHE_PREFIX = "storyline-";
const MAX_BOOKS = 8;
const MAX_RUNTIME_PAGES = 24;
const MAX_ASSETS = 80;
const SHELL_URLS = ["/", "/books", "/collections", "/shelf", "/offline", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      await cache.add("/offline");
      await Promise.allSettled(
        SHELL_URLS.filter((url) => url !== "/offline").map((url) => cache.add(url)),
      );
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
  if (event.data?.type === "CACHE_BOOK" && typeof event.data.url === "string") {
    event.waitUntil(
      cacheBook(event.data.url).then((result) => event.ports[0]?.postMessage(result)),
    );
    return;
  }
  if (event.data?.type === "CACHE_ASSETS" && Array.isArray(event.data.urls)) {
    event.waitUntil(cacheAssets(event.data.urls));
    return;
  }
  if (event.data?.type === "GET_CACHE_STATUS") {
    event.waitUntil(getCacheStatus().then((status) => event.ports[0]?.postMessage(status)));
    return;
  }
  if (event.data?.type === "CLEAR_OFFLINE") {
    event.waitUntil(clearOfflineCaches().then((status) => event.ports[0]?.postMessage(status)));
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (
    ["style", "script", "font", "image"].includes(request.destination) &&
    parseAssetUrl(request.url)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(
      isBookPath(url)
        ? localFirstBook(event, request)
        : networkFirst(request, RUNTIME_CACHE, MAX_RUNTIME_PAGES),
    );
    return;
  }
});

async function cacheBook(url) {
  const bookUrl = parseBookUrl(url);
  if (!bookUrl) {
    return { ok: false, reason: "invalid-url" };
  }
  const request = new Request(bookUrl, { credentials: "same-origin" });
  try {
    const bookCache = await caches.open(BOOK_CACHE);
    const cachedBook = await bookCache.match(request);
    if (cachedBook) {
      await bookCache.delete(request);
      await bookCache.put(request, cachedBook);
      await trimCache(bookCache, MAX_BOOKS);
      return { ok: true };
    }
    const response = await fetch(request);
    if (!isCacheableResponse(response, "text/html")) {
      return { ok: false, reason: "invalid-response" };
    }
    const assetUrls = extractAssetUrls(await response.clone().text(), bookUrl);
    await cacheAssets(assetUrls);
    await bookCache.put(request, response);
    await trimCache(bookCache, MAX_BOOKS);
    return { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  }
}

async function localFirstBook(event, request) {
  const cache = await caches.open(BOOK_CACHE);
  const cached = await cache.match(request);
  const update = fetch(request)
    .then(async (response) => {
      if (isCacheableResponse(response, "text/html")) {
        await cache.delete(request);
        await cache.put(request, response.clone());
        await trimCache(cache, MAX_BOOKS);
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(update.then(() => undefined));
    return cached;
  }
  return (await update) ?? (await caches.match("/offline"));
}

async function networkFirst(request, cacheName = SHELL_CACHE, maximum) {
  const cache = await caches.open(cacheName);
  const shouldCache = !new URL(request.url).search;
  try {
    const response = await fetch(request);
    if (shouldCache && isCacheableResponse(response, "text/html")) {
      await cache.delete(request);
      await cache.put(request, response.clone());
      if (maximum) {
        await trimCache(cache, maximum);
      }
    }
    return response;
  } catch {
    const runtimeMatch = shouldCache ? await cache.match(request) : null;
    return runtimeMatch ?? (await caches.match(request)) ?? (await caches.match("/offline"));
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    await cache.delete(request);
    await cache.put(request, response.clone());
    await trimCache(cache, MAX_ASSETS);
  }
  return response;
}

async function cacheAssets(urls) {
  const cache = await caches.open(ASSET_CACHE);
  const allowed = [...new Set(urls.map(parseAssetUrl).filter(Boolean))].slice(0, MAX_ASSETS);
  await Promise.allSettled(
    allowed.map(async (url) => {
      const request = new Request(url, { credentials: "same-origin" });
      if (await cache.match(request)) {
        return;
      }
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        await cache.delete(request);
        await cache.put(request, response);
      }
    }),
  );
  await trimCache(cache, MAX_ASSETS);
}

async function getCacheStatus() {
  const [books, assets, runtime] = await Promise.all([
    caches.open(BOOK_CACHE).then((cache) => cache.keys()),
    caches.open(ASSET_CACHE).then((cache) => cache.keys()),
    caches.open(RUNTIME_CACHE).then((cache) => cache.keys()),
  ]);
  return { ok: true, books: books.length, assets: assets.length, pages: runtime.length };
}

async function clearOfflineCaches() {
  await Promise.all([BOOK_CACHE, RUNTIME_CACHE].map((name) => caches.delete(name)));
  const assets = await caches.open(ASSET_CACHE).then((cache) => cache.keys());
  return { ok: true, books: 0, assets: assets.length, pages: 0 };
}

function parseBookUrl(value) {
  try {
    const url = new URL(value, self.location.origin);
    if (url.origin !== self.location.origin || !isBookPath(url)) {
      return null;
    }
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

function isBookPath(url) {
  return /^\/books\/[a-z0-9-]+\/?$/.test(url.pathname) && !url.search;
}

function parseAssetUrl(value) {
  try {
    const url = new URL(value, self.location.origin);
    if (
      url.origin !== self.location.origin ||
      !(url.pathname.startsWith("/_next/static/") || url.pathname === "/icon.svg")
    ) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

function extractAssetUrls(html, baseUrl) {
  const urls = [];
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const url = parseAssetUrl(new URL(match[1], baseUrl).href);
    if (url) {
      urls.push(url);
    }
  }
  return urls;
}

function isCacheableResponse(response, contentType) {
  return (
    response.ok &&
    response.type === "basic" &&
    !response.redirected &&
    response.headers.get("content-type")?.includes(contentType)
  );
}

async function trimCache(cache, maximum) {
  const keys = await cache.keys();
  await Promise.all(
    keys.slice(0, Math.max(0, keys.length - maximum)).map((key) => cache.delete(key)),
  );
}
