const GAME_BOOT = (() => {
  const VERSION_URL = "./version-manifest.json";
  const DB_NAME = "little-knight-local";
  const DB_VERSION = 1;
  const STORE = "meta";
  const CACHE_PREFIX = "little-knight-assets-";
  const CORE_CACHE = "little-knight-core-v2.4.0";
  let db = null;

  const $b = id => document.getElementById(id);
  const fmt = n => (n/1024/1024).toFixed(n > 10*1024*1024 ? 1 : 2) + " MB";

  function openDB(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE)};
      req.onsuccess=()=>{db=req.result;resolve(db)};
      req.onerror=()=>reject(req.error);
    })
  }
  function getMeta(key){
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,"readonly"),r=tx.objectStore(STORE).get(key);
      r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)
    })
  }
  function setMeta(key,val){
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,"readwrite"),r=tx.objectStore(STORE).put(val,key);
      r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)
    })
  }
  async function fetchJSON(url){
    const r=await fetch(url+"?t="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error("manifest "+r.status);return r.json()
  }
  async function cleanupOldCaches(keep){
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==keep).map(k=>caches.delete(k)))
  }
  function ui(status,pct=0,done=0,total=0){
    if($b("bootStatus"))$b("bootStatus").textContent=status;
    if($b("bootBar"))$b("bootBar").style.width=Math.max(0,Math.min(100,pct))+"%";
    if($b("bootPercent"))$b("bootPercent").textContent=Math.round(pct)+"%";
    if($b("bootSize"))$b("bootSize").textContent=fmt(done)+" / "+fmt(total||done||1)
  }
  async function downloadAsset(cache,asset,doneRef,total,index,count){
    const req=new Request(asset.url,{cache:"no-store"});
    const hit=await cache.match(req);
    if(hit){
      doneRef.value+=asset.size||0;
      ui(`ตรวจสอบทรัพยากร ${index+1}/${count}`, total?doneRef.value/total*100:100, doneRef.value,total);
      return;
    }
    const r=await fetch(asset.url,{cache:"no-store"});if(!r.ok)throw new Error("โหลด "+asset.url+" ไม่สำเร็จ");
    const buf=await r.arrayBuffer();
    await cache.put(req,new Response(buf,{headers:r.headers,status:200,statusText:"OK"}));
    doneRef.value+=asset.size||buf.byteLength;
    ui(`ดาวน์โหลด ${asset.label||asset.url}`, total?doneRef.value/total*100:100, doneRef.value,total)
  }
  async function install(manifest,previous){
    const cacheName=CACHE_PREFIX+manifest.version;
    const cache=await caches.open(cacheName);
    const prevMap=new Map((previous?.assets||[]).map(a=>[a.url,a.hash]));
    const changed=manifest.assets.filter(a=>prevMap.get(a.url)!==a.hash);
    const total=changed.reduce((s,a)=>s+(a.size||0),0);
    const done={value:0};

    if(!changed.length){
      ui("ทรัพยากรพร้อมเล่นแล้ว",100,manifest.totalSize||0,manifest.totalSize||0);
    } else {
      ui(previous?`พบแพตช์ ${manifest.version} • ${changed.length} ไฟล์`:`ดาวน์โหลดเกมครั้งแรก • ${changed.length} ไฟล์`,0,0,total);
      // Copy unchanged files from previous cache first
      if(previous){
        const oldCache=await caches.open(CACHE_PREFIX+previous.version);
        for(const a of manifest.assets){
          if(prevMap.get(a.url)===a.hash){
            const old=await oldCache.match(a.url);
            if(old) await cache.put(a.url,old.clone())
          }
        }
      }
      for(let i=0;i<changed.length;i++)await downloadAsset(cache,changed[i],done,total,i,changed.length)
    }

    await setMeta("manifest",manifest);
    await setMeta("installedVersion",manifest.version);
    await cleanupOldCaches(cacheName);
    return manifest
  }
  async function boot(){
    try{
      ui("กำลังเปิดคลังทรัพยากร...",2,0,1);
      await openDB();
      const previous=await getMeta("manifest");
      let remote=null;
      try{
        remote=await fetchJSON(VERSION_URL);
      }catch(err){
        if(previous){
          ui(`ออฟไลน์ • ใช้ทรัพยากร ${previous.version}`,100,previous.totalSize||0,previous.totalSize||0);
          return previous
        }
        throw err
      }
      if(previous?.version===remote.version){
        const cache=await caches.open(CACHE_PREFIX+remote.version);
        const first=remote.assets[0];
        if(first && !(await cache.match(first.url))) return install(remote,null);
        ui(`เวอร์ชัน ${remote.version} พร้อมเล่น`,100,remote.totalSize||0,remote.totalSize||0);
        return remote
      }
      return install(remote,previous)
    }catch(err){
      console.error(err);
      ui("ดาวน์โหลดทรัพยากรไม่สำเร็จ • ตรวจสอบอินเทอร์เน็ต",0,0,1);
      $b("bootRetry")?.classList.remove("hidden");
      return new Promise((resolve,reject)=>{
        if($b("bootRetry"))$b("bootRetry").onclick=()=>location.reload()
      })
    }
  }


  async function prefetchThree(){
    const url="https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js";
    try{const c=await caches.open("little-knight-vfx-libs");if(!(await c.match(url))){const r=await fetch(url,{mode:"cors",cache:"force-cache"});if(r.ok)await c.put(url,r.clone())}}catch(_){}
  }

  const ready=boot().then(async m=>{await prefetchThree();
    window.__ASSET_MANIFEST__=m;
    setTimeout(()=>{const s=$b("bootScreen");if(s){s.classList.add("done");setTimeout(()=>s.remove(),400)}},180);
    return m
  });
  return {ready,get version(){return window.__ASSET_MANIFEST__?.version||"unknown"}}
})();
window.GAME_BOOT=GAME_BOOT;
