const CORE="little-knight-core-v2.0.0";
const CORE_ASSETS=["./","./index.html","./style.css?v=2.0.0","./bootstrap.js?v=2.0.0","./three-effects.js?v=2.0.0","./game.js?v=2.0.0","./manifest.webmanifest","./version-manifest.json"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CORE).then(c=>c.addAll(CORE_ASSETS)))});
self.addEventListener("activate",e=>{e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("little-knight-core-")&&k!==CORE).map(k=>caches.delete(k))))]))});
self.addEventListener("fetch",e=>{
 const u=new URL(e.request.url);
 if(u.pathname.endsWith("/version-manifest.json")){
   e.respondWith(fetch(e.request,{cache:"no-store"}).catch(()=>caches.match("./version-manifest.json")));return
 }
 if(e.request.mode==="navigate"){
   e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CORE).then(x=>x.put("./index.html",c));return r}).catch(()=>caches.match("./index.html")));return
 }
 if(u.origin===location.origin){
   e.respondWith((async()=>{
     const names=await caches.keys();
     for(const n of names.filter(x=>x.startsWith("little-knight-assets-")).reverse()){
       const c=await caches.open(n),r=await c.match(e.request);if(r)return r
     }
     const core=await caches.open(CORE),hit=await core.match(e.request);if(hit)return hit;
     try{return await fetch(e.request)}catch{return new Response("",{status:504})}
   })())
 }
});
