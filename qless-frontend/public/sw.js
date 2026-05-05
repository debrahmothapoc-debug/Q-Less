const CACHE = "qless-v1";
const STATIC = ["/", "/index.html", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.url.includes("onrender.com") || e.request.url.includes("/api")) {
    e.respondWith(fetch(e.request).catch(() => new Response(JSON.stringify({error:"Offline"}),{status:503,headers:{"Content-Type":"application/json"}})));
    return;
  }
  e.respondWith(fetch(e.request).then(r => { if(r.ok){const c=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c));} return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("/index.html"))));
});
