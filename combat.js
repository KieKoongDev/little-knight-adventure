/* Shared encounter rules. The host owns boss casts; each player resolves their own defense. */
let guardPointer=false;
const TACTICAL_ITEMS={
 firebomb:{name:"ระเบิดเพลิง",color:"#ff925c",symbol:"F"},
 frostbomb:{name:"ระเบิดเยือกแข็ง",color:"#99e8ff",symbol:"I"},
 repair:{name:"ชุดซ่อมเกราะ",color:"#d2def4",symbol:"AR"},
 rally:{name:"เครื่องรางฟื้นฟูทีม",color:"#87ffd0",symbol:"+"}
};
function resetCombat(){guardPointer=false;blocking=false;holdingSkill=false;holdingAttack=false;heldObject=null;joy.x=joy.y=0;for(const k of Object.keys(keys))keys[k]=false;$("blockBtn").classList.remove("active");$("encounterHint").textContent=""}
window.addEventListener("blur",()=>{guardPointer=false;for(const k of Object.keys(keys))keys[k]=false;joy.x=joy.y=0;holdingSkill=false;holdingAttack=false;if(player)stopGuard()});
window.addEventListener("keydown",e=>{if(e.key==="Shift"&&!e.repeat){e.preventDefault();dash()}});
function liveTeam(){return [player,...(NET.enabled?Array.from(NET.peers.values()).filter(p=>p.playerId!==NET.playerId):[])].filter(p=>p&&p.hp>0&&!p.dead&&!p.downed&&!p.respawning)}
function updateCombat(dt){
 if(!player)return;
 player.dashCd=Math.max(0,(player.dashCd||0)-dt);
 if(player.dashTime>0){const step=Math.min(dt,player.dashTime);player.dashTime-=step;player.x=clamp(player.x+player.dashVX*step,55,1235);player.y=clamp(player.y+player.dashVY*step,225,625);effects.push({type:"dust",x:player.x,y:player.y,vx:0,vy:0,life:.18,color:"#9cceea",size:4})}
 if(NET.enabled&&!NET.isHost)for(const e of enemies){if(e.cast)e.cast.left=Math.max(0,e.cast.left-dt);e.recovery=Math.max(0,(e.recovery||0)-dt)}
 const boss=enemies.find(e=>e.boss&&!e.dead),hint=$("encounterHint");
 const label=boss?(boss.cast?.label||(boss.recovery>0?"บอสเสียหลัก • โจมตีได้แรงขึ้น!":`PHASE ${boss.phase||1} • เตรียมหลบและสวนกลับ`)):"";
 if(hint.textContent!==label)hint.textContent=label;
}
function sendEncounterEvent(event){receiveEncounterEvent(event);if(NET.enabled&&NET.isHost)NET.send("encounter_event",{event})}
function receiveEncounterEvent(event){
 if(!event||!player)return;
 if(event.kind==="notice"){showToast(event.text);return}
 if(event.kind==="projectile"){projectiles.push({...event.shot,shared:true});return}
 if(event.kind!=="hit")return;
 const source=enemies.find(e=>e.id===event.sourceId);
 effects.push({type:"ring",x:event.x,y:event.y,life:.35,color:event.color||"#ff875d",radius:event.rx});
 if(event.shape==="ring"){
  const distance=Math.hypot(player.x-event.x,player.y-event.y);
  if(distance>event.inner&&distance<event.rx&&player.z<60)takeHit(event.dmg,(event.face||1)*28,source);
 }else if(event.shape==="ellipse"){if(Math.pow((player.x-event.x)/event.rx,2)+Math.pow((player.y-event.y)/event.ry,2)<1&&player.z<60)takeHit(event.dmg,(event.face||1)*28,source);
 }else if(Math.abs(player.x-event.x)<event.rx&&Math.abs(player.y-event.y)<event.ry&&player.z<(event.jumpable===false?Infinity:60))takeHit(event.dmg,(event.face||1)*28,source);
}
function updateBossEncounter(e,dt){
 e.phase=e.hp/e.maxHp<.5?2:1;e.stateTime+=dt;
 if(e.recovery>0){e.recovery=Math.max(0,e.recovery-dt);e.state="hit";return}
 if(e.cast){
  e.cast.left-=dt;e.state="skill";
  if(e.cast.left<=0){const cast=e.cast;e.cast=null;resolveBossCast(e,cast);e.recovery=cast.kind==="break"?.9:1.15;e.attackCd=1.2}
  return;
 }
 e.attackCd=Math.max(0,e.attackCd-dt);
 const team=liveTeam();if(!team.length){e.state="idle";return}
 const target=team.reduce((best,p)=>Math.hypot(p.x-e.x,p.y-e.y)<Math.hypot(best.x-e.x,best.y-e.y)?p:best,team[0]);
 const dx=target.x-e.x,dy=target.y-e.y,d=Math.hypot(dx,dy)||1;e.facing=dx>=0?1:-1;
 if(d>235){e.state="run";e.x=clamp(e.x+dx/d*e.spd*dt,65,1215);e.y=clamp(e.y+dy/d*e.spd*.65*dt,240,605)}else e.state="idle";
 if(e.attackCd>0)return;
 // Each boss has a recognizable sequence; phase two shortens the warning, never hides it.
 const rotations=[["slam","line","break","stack"],["line","break","slam","stack"],["ring","stack","break","line"],["stack","ring","line","break"]];
 const sequence=rotations[e.bossIndex%4],kind=sequence[(e.castIndex||0)%sequence.length];e.castIndex=(e.castIndex||0)+1;
 const marked=team[(e.castIndex-1)%team.length],duration=(kind==="break"?2.8:kind==="stack"?2.2:1.25)*(e.phase===2?.85:1);
 const strength=Math.round(65*(1+.55*(team.length-1)));
 e.cast={kind,left:duration,duration,x:kind==="line"?640:kind==="ring"?e.x:marked.x,y:kind==="ring"?e.y:marked.y,rx:kind==="line"?590:kind==="ring"?320:kind==="break"?1250:110,ry:kind==="line"?52:kind==="break"?720:90,inner:120,breakLeft:strength,breakMax:strength,label:kind==="slam"?"วงแดง • ออกจากพื้นที่หรือกระโดด":kind==="line"?"แนวพุ่ง • หลบขึ้นหรือลง":kind==="ring"?"วงแหวน • เข้าวงในหรือถอยออก":kind==="break"?"ช่วยกันตีบอส • ขัดจังหวะก่อนเต็มหลอด":team.length>1?"วงฟ้า • รวมกลุ่มแบ่งรับความเสียหาย":"วงฟ้า • ตั้งการ์ดหรือหลบออก"};
 e.state="skill";e.stateTime=0;
}
function resolveBossCast(e,c){
 const count=Math.max(1,liveTeam().filter(p=>Math.abs(p.x-c.x)<c.rx&&Math.abs(p.y-c.y)<c.ry).length);
 sendEncounterEvent({kind:"hit",sourceId:e.id,x:c.kind==="break"?640:c.x,y:c.kind==="break"?420:c.y,rx:c.rx,ry:c.ry,inner:c.inner,shape:c.kind==="ring"?"ring":["line","break"].includes(c.kind)?"rect":"ellipse",face:e.facing,dmg:e.dmg*(c.kind==="stack"?2/count:c.kind==="break"?1.5:1.1),jumpable:c.kind!=="break",color:c.kind==="stack"?"#83dcff":"#ff875d"});
}
function drawEncounterTelegraphs(){
 for(const e of enemies){if(!e.boss||e.dead||!e.cast)continue;const c=e.cast,progress=clamp(1-c.left/c.duration,0,1),color=c.kind==="stack"?"#79dfff":c.kind==="break"?"#e6bbff":"#ff8065";
  ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3;
  if(c.kind==="break"){
   ctx.globalAlpha=.25;ctx.fillRect(e.x-65,e.y-155,130,10);ctx.globalAlpha=1;ctx.fillRect(e.x-65,e.y-155,130*c.breakLeft/c.breakMax,10);
   ctx.beginPath();ctx.arc(e.x,e.y-60,75,-Math.PI/2,-Math.PI/2+progress*Math.PI*2);ctx.stroke();
  }else{
   ctx.globalAlpha=.15+.12*progress;ctx.beginPath();
   if(c.kind==="line")ctx.rect(c.x-c.rx,c.y-c.ry,c.rx*2,c.ry*2);
   else if(c.kind==="ring"){ctx.arc(c.x,c.y,c.rx,0,Math.PI*2);ctx.arc(c.x,c.y,c.inner,0,Math.PI*2,true)}
   else ctx.ellipse(c.x,c.y,c.rx,c.ry,0,0,Math.PI*2);
   ctx.fill("evenodd");ctx.globalAlpha=.95;ctx.stroke();
   ctx.beginPath();ctx.arc(c.x,c.y,22,-Math.PI/2,-Math.PI/2+progress*Math.PI*2);ctx.stroke();
  }ctx.restore();
 }
}
function useTacticalItem(h){
 if(!TACTICAL_ITEMS[h.type])return false;
 heldObject=null;setState(player,"skill",true);player.skillMode="item";player.actionHit=true;
 if(h.type==="repair"){player.armor=player.maxArmor;showToast("ซ่อมเกราะเต็มแล้ว")}
 else if(h.type==="rally"){applySupportPulse(35,true);if(NET.enabled)NET.send("support_pulse",{amount:35})}
 else{
  const el=h.type==="firebomb"?"fire":"frost",x=clamp(player.x+player.facing*140,55,1235),y=player.y;
  for(const e of enemies)if(!e.dead&&Math.hypot(e.x-x,e.y-y)<180)damageEnemy(e,player.baseAtk*2.8,player.facing*22,true,el);
  effects.push({type:el==="fire"?"firePillar":"iceSpike",x,y,life:.7,size:125,color:TACTICAL_ITEMS[h.type].color});
  showToast(TACTICAL_ITEMS[h.type].name);
 }Audio.pickup();return true;
}
function drawTacticalIcon(x,y,type,label=false){const item=TACTICAL_ITEMS[type];if(!item)return;ctx.save();ctx.translate(x,y);ctx.fillStyle="#14202e";ctx.strokeStyle=item.color;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-15,-17,30,34,7);ctx.fill();ctx.stroke();ctx.fillStyle=item.color;ctx.textAlign="center";ctx.font="bold 13px Arial";ctx.fillText(item.symbol,0,5);if(label){ctx.font="12px Tahoma";ctx.fillText(item.name,0,-25)}ctx.restore()}
