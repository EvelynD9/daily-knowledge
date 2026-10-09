const CACHE = "ocw-shell-v2";
const ROOT = new URL("./", self.location).pathname;
const SHELL = ["", "index.html", "styles.css", "content.js", "app.js", "features.js", "analytics-config.js", "logo-mark.svg", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"].map(path => ROOT + path);
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("ocw-shell-") && key !== CACHE).map(key => caches.delete(key)))));
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(async () => {
      const cache = await caches.open(CACHE);
      const exact = await cache.match(url.pathname);
      if (exact) return exact;
      if (url.pathname === ROOT || url.pathname === ROOT + "index.html") return cache.match(ROOT + "index.html");
      return new Response('<h1>You are offline</h1><p>This public page is not cached. <a href="' + ROOT + '">Open your daily cards</a>.</p>', { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }));
  } else if (SHELL.includes(url.pathname)) {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
      return response;
    }).catch(() => caches.match(event.request)));
  }
});
