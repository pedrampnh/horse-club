/* Generated with the static HTML/CSS/JS package. Never cache API responses. */
const VERSION = "b25f77096669b5d9";
const HOME = self.registration.scope;
const CACHE_PREFIX = `horse-club-web:${HOME}|`;
const CACHE = `${CACHE_PREFIX}${VERSION}`;
// The HTML shell already contains the scripts, styles and font.
const ASSETS = ["./", "./manifest.webmanifest", "./icon-512.png"]
  .map((path) => new URL(path, HOME).href);

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS.map((url) => new Request(url, { cache: "reload" })));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
        .map((key) => caches.delete(key)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    const page = `${url.origin}${url.pathname}`;
    if (page !== HOME && page !== new URL("index.html", HOME).href) return;
    event.respondWith((async () => {
      let response;
      try {
        response = await fetch(request);
        if (response.ok) return response;
      } catch {
        // Use the matching shell and its assets when offline.
      }
      const cache = await caches.open(CACHE);
      return (await cache.match(HOME)) ?? response ?? Response.error();
    })());
  } else if (ASSETS.includes(url.href)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match(request)) ?? fetch(request);
    })());
  }
});
