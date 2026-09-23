const CACHE="josh-gym-v14";
const STATIC=["./manifest.webmanifest?v=3","./app-icon.svg?v=3"];
self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)));
});
self.addEventListener("activate",e=>{
  e.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  ]));
});
self.addEventListener("fetch",e=>{
  const req=e.request;
  const url=new URL(req.url);
  const isPage=req.mode==="navigate"||url.pathname.endsWith("/")||url.pathname.endsWith("/index.html");
  if(isPage){
    e.respondWith(fetch(req,{cache:"no-store"}).catch(()=>caches.match("./index.html")));
    return;
  }
  e.respondWith(fetch(req).then(r=>{
    const copy=r.clone();
    caches.open(CACHE).then(c=>c.put(req,copy));
    return r;
  }).catch(()=>caches.match(req)));
});