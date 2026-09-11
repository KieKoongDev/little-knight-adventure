(() => {
 const CDN="https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js";
 const CACHE="little-knight-vfx-libs";
 let THREE=null,renderer=null,scene=null,camera=null,canvas=null,active=[],ready=false,loading=null;
 const hex=c=>{try{return parseInt(String(c).replace("#",""),16)}catch{return 0xffffff}};
 async function loadThree(){
   if(THREE)return THREE;if(loading)return loading;
   loading=(async()=>{
     try{
       const cache=await caches.open(CACHE);let r=await cache.match(CDN);
       if(!r){r=await fetch(CDN,{mode:"cors",cache:"force-cache"});if(r.ok)await cache.put(CDN,r.clone())}
       if(!r||!r.ok)return null;const code=await r.text(),url=URL.createObjectURL(new Blob([code],{type:"text/javascript"}));
       try{THREE=await import(url)}finally{setTimeout(()=>URL.revokeObjectURL(url),1500)}
       return THREE
     }catch(e){console.warn("ThreeFX fallback",e);return null}
   })();return loading
 }
 async function init(c){
   canvas=c;if(!canvas)return false;const T=await loadThree();if(!T)return false;
   try{
     renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:"low-power"});
     renderer.setPixelRatio(Math.min(1.5,devicePixelRatio||1));renderer.setClearColor(0x000000,0);
     scene=new T.Scene();camera=new T.OrthographicCamera(0,1280,720,0,-100,100);camera.position.z=10;ready=true;resize();return true
   }catch(e){console.warn(e);return false}
 }
 function resize(){if(!ready||!renderer||!canvas)return;const r=canvas.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false)}
 function burst(x,y,color,type="magic"){
   if(!ready||!THREE)return;
   const T=THREE,c=hex(color),count=type==="impactHeavy"?14:["magic","heal","ice","fire","lightning","dark"].includes(type)?14:9;
   if(["ring","magic","heal","wind","ice","fire","lightning","dark"].includes(type)){
     const geo=new T.RingGeometry(type==="magic"?18:12,type==="magic"?23:16,32);
     const mat=new T.MeshBasicMaterial({color:c,transparent:true,opacity:.62,side:T.DoubleSide,blending:T.AdditiveBlending,depthTest:false});
     const m=new T.Mesh(geo,mat);m.position.set(x,720-y,1);m.scale.set(.9,.9,.9);scene.add(m);active.push({o:m,life:.52,max:.52,vx:0,vy:0,grow:type==="heal"?2.7:3.5,spin:.7})
   }
   for(let i=0;i<count;i++){
     const pw=type==="lightning"?11:type==="dash"?9:type==="ice"?4:6,ph=type==="lightning"?2:type==="dash"?3:type==="ice"?10:6;const geo=new T.PlaneGeometry(pw,ph),mat=new T.MeshBasicMaterial({color:i%4===0?0xffffff:c,transparent:true,opacity:.78,blending:T.AdditiveBlending,depthTest:false});
     const m=new T.Mesh(geo,mat),a=Math.random()*Math.PI*2,s=70+Math.random()*(type==="impactHeavy"?250:150);
     m.position.set(x,720-y,2);m.rotation.z=a;scene.add(m);active.push({o:m,life:.28+Math.random()*.20,max:.48,vx:Math.cos(a)*s,vy:Math.sin(a)*s,grow:.2,spin:(Math.random()-.5)*5})
   }
 }
 function update(dt){
   if(!ready)return;
   for(let i=active.length-1;i>=0;i--){const p=active[i];p.life-=dt;p.o.position.x+=p.vx*dt;p.o.position.y+=p.vy*dt;p.o.rotation.z+=p.spin*dt;
     if(p.grow){const s=p.o.scale.x+p.grow*dt;p.o.scale.set(s,s,s)}p.o.material.opacity=Math.max(0,p.life/p.max)*.72;
     if(p.life<=0){scene.remove(p.o);p.o.geometry.dispose();p.o.material.dispose();active.splice(i,1)}
   }
   renderer.render(scene,camera)
 }
 window.ThreeFX={init,resize,burst,update,get ready(){return ready}}
})();