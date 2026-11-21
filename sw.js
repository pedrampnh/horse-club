// نسخه کش را با هر تغییر در آیکن/منیفست/صفحه بالا ببرید تا کش قدیمی پاک شود
const CACHE = "arya-club-reports-v8";
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-v2-512.png",
];

// این فایل‌ها همیشه اول از شبکه گرفته می‌شوند تا تغییر آیکن/منیفست
// هیچ‌وقت پشت کش قدیمی گیر نکند
const NETWORK_FIRST = /(manifest\.webmanifest|icon[^/]*\.png)(\?.*)?$/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(FILES.map((f) => new Request(f, { cache: "reload" }))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("arya-club-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith(self.registration.scope))
    return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(async (response) => {
          if (response.ok)
            (await caches.open(CACHE)).put("./index.html", response.clone());
          return response;
        })
        .catch(() => caches.match("./index.html")),
    );
  } else if (NETWORK_FIRST.test(req.url)) {
    event.respondWith(
      fetch(req, { cache: "reload" })
        .then(async (response) => {
          if (response.ok) (await caches.open(CACHE)).put(req, response.clone());
          return response;
        })
        .catch(() => caches.match(req)),
    );
  } else {
    event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
  }
});
