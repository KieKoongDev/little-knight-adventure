/* One articulated character model for selection cards and gameplay. */
const HERO_LOOKS={
 ronin:{cloth:"#26374a",metal:"#8193a3",trim:"#b27652",hair:"#202733",skin:"#d5a17d",style:"tie"},
 ember:{cloth:"#552e28",metal:"#976c4f",trim:"#ef9b57",hair:"#533128",skin:"#bb8061",style:"crop"},
 arcane:{cloth:"#4a3b64",metal:"#9b94b1",trim:"#91cfed",hair:"#d6d8df",skin:"#ddb29b",style:"long"},
 kira:{cloth:"#302c43",metal:"#6f728c",trim:"#bfa2d5",hair:"#26212f",skin:"#c7947d",style:"tie"},
 bronn:{cloth:"#283d44",metal:"#8b9b9b",trim:"#d0aa66",hair:"#59463c",skin:"#c69a7b",style:"crop",heavy:true},
 lyra:{cloth:"#344337",metal:"#8c9983",trim:"#dab786",hair:"#ad7545",skin:"#d9ac86",style:"long"},
 sora:{cloth:"#29464c",metal:"#8ba8ad",trim:"#ced2b1",hair:"#27353a",skin:"#c89675",style:"tie"},
 nami:{cloth:"#28504e",metal:"#91b6b1",trim:"#b4e5d8",hair:"#263d4a",skin:"#d7aa90",style:"long"},
 grom:{cloth:"#4b302b",metal:"#7c7772",trim:"#c88857",hair:"#5c3e2c",skin:"#b98561",style:"crop",heavy:true},
 faye:{cloth:"#464052",metal:"#a19ba6",trim:"#e5d09b",hair:"#bfa67b",skin:"#dab39a",style:"tie"}
};
function characterPose(p){
 const t=p.stateTime||0,state=p.state||"idle",run=state==="run"?Math.sin(t*10):0;
 let hand={x:23,y:-56},angle=-.6,lean=0,crouch=0;
 const attack=state.startsWith("attack"),skill=state==="skill"||state==="ultimate";
 if(attack||skill){
  const duration=state==="attack3"?.43:skill?.55:.375,q=clamp(t/duration,0,1);
  // Deliberate wind-up, fast contact, then controlled recovery.
  const swing=q<.25?-.16*(q/.25):q<.62?Math.pow((q-.25)/.37,.75):1-(q-.62)/.38*.18;
  const style=p.attackStyle||"horizontal";
  angle=style==="rising"?.7-swing*2.3:style==="overhead"?-2.4+swing*3.1:style==="reverse"?1.1-swing*2.3:-1.5+swing*2.4;
  hand={x:18+Math.cos(angle)*19,y:-76+Math.sin(angle)*21};lean=Math.sin(q*Math.PI)*.07;
 }
 if(state==="block"){hand={x:29,y:-82};angle=-1.25;crouch=4;lean=-.035}
 if(state==="hit"){lean=-.10;crouch=3}
 if(state==="jump"){crouch=-2;hand={x:24,y:-66};angle=-.65}
 return{hand,angle,lean,crouch,run,bob:state==="run"?-Math.abs(run)*1.1:Math.sin(t*2.4)*.35};
}
function renderCharacter(c,p){
 const look=HERO_LOOKS[p.hero]||HERO_LOOKS.ronin,pose=characterPose(p),heavy=look.heavy;
 const cloth=p.costume==="royal"?"#273b65":p.costume==="ember"?"#652e29":look.cloth;
 const trim=p.costume==="royal"?"#d5b470":p.costume==="ember"?"#ef965a":look.trim;
 const type=p.weapon?.type||p.weaponType||"katana";
 c.save();c.translate(p.x,p.y-(p.z||0)+pose.bob+pose.crouch);c.scale(p.facing||1,1);c.rotate(pose.lean);
 const path=(points,fill,stroke="#151b24")=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=1.1;c.stroke()};
 const segment=(a,b,width,color)=>{c.lineCap="round";c.strokeStyle="#151b24";c.lineWidth=width+2;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.strokeStyle=color;c.lineWidth=width;c.stroke()};
 const limbIK=(a,b,l1,l2,bend,width,color)=>{
  let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.01;const reach=Math.min(d,l1+l2-.01);dx/=d;dy/=d;
  const along=(l1*l1-l2*l2+reach*reach)/(2*reach),off=Math.sqrt(Math.max(0,l1*l1-along*along))*bend;
  const joint={x:a.x+dx*along-dy*off,y:a.y+dy*along+dx*off},tip={x:a.x+dx*reach,y:a.y+dy*reach};
  segment(a,joint,width,color);segment(joint,tip,width*.85,color);return tip;
 };
 // Cloth follows the torso with a small lag; it never drives the arms.
 const sway=pose.run*2;
 path([[-12,-94],[-20,-85],[-24+sway,-39],[-9,-49],[3,-88]],cloth);
 if(look.style==="long")path([[-7,-115],[-13,-100],[-11,-81],[1,-94],[6,-112]],look.hair);
 // Two-segment legs with planted feet and a narrow, athletic stance.
 const stride=pose.run*15,air=p.state==="jump";
 const feet=[{x:-10-stride,y:air?-15:Math.min(0,pose.run*7)},{x:11+stride,y:air?-6:Math.min(0,-pose.run*7)}];
 feet.forEach((foot,i)=>{const hip={x:i?7:-6,y:-52};limbIK(hip,foot,27,27,i?1:-1,heavy?10:8,i?cloth:"#26303b");path([[foot.x-5,foot.y-10],[foot.x+4,foot.y-9],[foot.x+9,foot.y-2],[foot.x+8,foot.y+2],[foot.x-6,foot.y+2]],"#29313b")});
 const backHand={x:-10-pose.run*3,y:-53};limbIK({x:-12,y:-88},backHand,21,20,-1,7,cloth);
 // Tapered torso and fitted armor, with readable waist and neck.
 path([[-13,-94],[heavy?19:15,-92],[heavy?17:12,-70],[10,-54],[-10,-54],[-14,-74]],cloth);
 const grad=c.createLinearGradient(-13,-88,18,-62);grad.addColorStop(0,look.metal);grad.addColorStop(.5,look.metal);grad.addColorStop(1,"#394552");
 path([[-11,-91],[heavy?17:13,-89],[11,-70],[0,-66],[-11,-74]],grad);
 c.strokeStyle=trim;c.lineWidth=1.5;c.beginPath();c.moveTo(-9,-84);c.lineTo(9,-80);c.lineTo(10,-71);c.stroke();
 path([[-11,-65],[12,-65],[11,-60],[-11,-60]],"#44392f");path([[-2,-65],[3,-65],[3,-60],[-2,-60]],trim);
 if(["staff","wand"].includes(type))path([[-10,-60],[11,-60],[18,-25],[4,-29],[-2,-42],[-12,-26],[-18,-30]],cloth);
 // Neck, angular jaw, restrained facial features. Roughly seven heads tall.
 path([[-3,-103],[5,-103],[6,-94],[-3,-94]],look.skin);
 path([[-7,-119],[3,-122],[9,-117],[10,-108],[5,-101],[-2,-102],[-7,-109]],look.skin);
 path([[-8,-116],[-7,-123],[1,-126],[8,-122],[10,-117],[4,-118],[0,-115],[-5,-113],[-6,-105],[-9,-110]],look.hair);
 if(look.style==="tie")path([[-7,-119],[-14,-116],[-18,-103],[-11,-108],[-9,-117]],look.hair);
 c.strokeStyle="#3b2b29";c.lineWidth=.9;c.beginPath();c.moveTo(3,-112);c.lineTo(7,-112);c.moveTo(7,-110);c.lineTo(9,-107);c.lineTo(6,-107);c.moveTo(4,-104);c.lineTo(7,-104);c.stroke();
 path([[-7,-98],[7,-98],[11,-93],[-10,-93]],trim);
 // Hand target drives the elbow through IK; the weapon shares this exact grip.
 const grip=limbIK({x:12,y:-89},pose.hand,22,22,1,heavy?9:7,cloth);
 path([[7,-94],[19,-92],[21,-84],[11,-83]],look.metal);
 c.save();c.translate(grip.x,grip.y);c.rotate(pose.angle);
 c.strokeStyle="#d3e0e9";c.fillStyle="#b8cbd6";c.lineWidth=2;
 if(["bow","boomerang","chakram"].includes(type)){
  c.beginPath();if(type==="bow"){c.moveTo(1,-28);c.quadraticCurveTo(31,0,1,28);c.stroke();c.strokeStyle=trim;c.beginPath();c.moveTo(1,-28);c.lineTo(-3,0);c.lineTo(1,28)}else c.arc(12,0,19,-2.2,2.2);c.stroke();
 }else if(type==="gauntlet"){path([[-5,-7],[11,-7],[14,5],[-4,7]],look.metal)}
 else{
  const long=["spear","halberd","staff"].includes(type),length=long?70:type==="greatsword"?63:46;
  c.strokeStyle="#735944";c.lineWidth=long?3:4;c.beginPath();c.moveTo(long?-35:-9,0);c.lineTo(long?length-13:12,0);c.stroke();
  if(["staff","wand"].includes(type)){c.fillStyle=trim;c.beginPath();c.moveTo(length-19,0);c.lineTo(length-10,-8);c.lineTo(length,0);c.lineTo(length-10,8);c.closePath();c.fill()}
  else if(["axe","hammer","halberd"].includes(type)){path([[length-18,-5],[length-10,-17],[length+3,-15],[length+6,10],[length-13,13]],look.metal)}
  else{path([[10,-2],[length,-3],[length+9,0],[length,3],[10,3]],"#c2d4df");c.strokeStyle=trim;c.lineWidth=3;c.beginPath();c.moveTo(8,-8);c.lineTo(8,8);c.stroke()}
 }
 c.restore();c.fillStyle=look.skin;c.beginPath();c.ellipse(grip.x,grip.y,4,3,.3,0,Math.PI*2);c.fill();
 if(type==="shieldblade"){path([[19,-76],[36,-72],[35,-44],[27,-35],[18,-43],[15,-66]],look.metal);c.strokeStyle=trim;c.beginPath();c.moveTo(25,-70);c.lineTo(27,-41);c.stroke()}
 c.restore();
}
function refreshCharacterCards(){
 for(const card of document.querySelectorAll(".hero-card")){
  let preview=card.querySelector("canvas");if(!preview){preview=document.createElement("canvas");preview.className="character-preview";preview.width=320;preview.height=280;preview.setAttribute("aria-label",HEROES[card.dataset.hero].name);card.querySelector("img")?.replaceWith(preview)}
  const c=preview.getContext("2d");c.clearRect(0,0,320,280);const bg=c.createRadialGradient(160,130,10,160,140,150);bg.addColorStop(0,"#283545");bg.addColorStop(1,"#101720");c.fillStyle=bg;c.fillRect(0,0,320,280);
  c.save();c.scale(1.75,1.75);renderCharacter(c,{hero:card.dataset.hero,costume:selectedCostume,x:83,y:151,z:0,facing:1,state:"idle",stateTime:0,weapon:starterWeapon(card.dataset.hero)});c.restore();
 }
}
refreshCharacterCards();
document.querySelectorAll(".costume-chip").forEach(b=>b.addEventListener("click",refreshCharacterCards));
