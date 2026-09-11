const APP_VERSION="v2.3.0";
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");ctx.imageSmoothingEnabled=true;
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

const HEROES={
 ronin:{name:"ไร",tag:"โรนิน",sprite:"assets/heroes_v3/ronin.png",speed:260,hp:132,mp:100,atk:23,color:"#c9d6e2",starter:"Training Katana",skills:["crescent","iaido"],skillNames:["จันทร์เสี้ยว","อิไอโด"],role:"ประชิดสมดุล",dmg:1.06,guard:.55,parry:.17},
 ember:{name:"เคน",tag:"นักสู้",sprite:"assets/heroes_v3/ember.png",speed:292,hp:118,mp:92,atk:21,color:"#e2d0be",starter:"Combat Knuckles",skills:["rush","uppercut"],skillNames:["พุ่งเพลิง","หมัดเสย"],role:"คอมโบเร็ว",dmg:1.04,guard:.64,parry:.13},
 arcane:{name:"มิร่า",tag:"นักเวท",sprite:"assets/heroes_v3/arcane.png",speed:248,hp:102,mp:118,atk:17,color:"#cfd5e6",starter:"Oak Focus",skills:["arcBurst","frostNova"],skillNames:["อาร์คเบิร์สต์","โนวาน้ำแข็ง"],role:"เวทคุมพื้นที่",dmg:.92,guard:.68,parry:.12},
 kira:{name:"คิระ",tag:"เงา",sprite:"assets/heroes_v3/kira.png",speed:318,hp:96,mp:95,atk:19,color:"#d6cfe0",starter:"Night Fangs",skills:["shadowDance","assassinate"],skillNames:["ระบำเงา","จู่โจมจุดตาย"],role:"Burst / หลบไว",dmg:1.08,guard:.72,parry:.16},
 bronn:{name:"บรอนน์",tag:"ผู้พิทักษ์",sprite:"assets/heroes_v3/bronn.png",speed:222,hp:165,mp:92,atk:25,color:"#cad8dc",starter:"Guard Saber",skills:["quake","aegis"],skillNames:["ทุบแผ่นดิน","โล่อีจิส"],role:"แทงก์ / คุมฝูง",dmg:.98,guard:.28,parry:.21},
 lyra:{name:"ไลรา",tag:"นักธนู",sprite:"assets/heroes_v3/lyra.png",speed:286,hp:104,mp:105,atk:18,color:"#ddd8c3",starter:"Hunter Bow",skills:["piercingVolley","backstepShot"],skillNames:["ฝนศรทะลวง","ถอยยิง"],role:"ยิงไกล / เคลื่อนที่",dmg:.98,guard:.67,parry:.13},
 sora:{name:"โซระ",tag:"นักลมหอก",sprite:"assets/heroes_v3/sora.png",speed:282,hp:116,mp:103,atk:21,color:"#c7dde0",starter:"Ash Spear",skills:["windThrust","cyclone"],skillNames:["หอกวายุ","วงแหวนพายุ"],role:"ระยะกลาง / ลม",dmg:1.02,guard:.57,parry:.16},
 nami:{name:"นามิ",tag:"นักเวทวารี",sprite:"assets/heroes_v3/nami.png",speed:252,hp:108,mp:128,atk:17,color:"#c6ded8",starter:"Apprentice Wand",skills:["aquaBolt","healingRain"],skillNames:["กระสุนวารี","ฝนเยียวยา"],role:"เวท / สนับสนุน",dmg:.91,guard:.64,parry:.14},
 grom:{name:"กรอม",tag:"เบอร์เซิร์ก",sprite:"assets/heroes_v3/grom.png",speed:230,hp:148,mp:86,atk:28,color:"#dfd1c7",starter:"Rift Axe",skills:["rageSmash","ironCharge"],skillNames:["ฟาดคลั่ง","พุ่งเหล็ก"],role:"หนัก / Stagger",dmg:1.10,guard:.48,parry:.12},
 faye:{name:"เฟย์",tag:"นักจักร",sprite:"assets/heroes_v3/faye.png",speed:304,hp:101,mp:108,atk:19,color:"#ded9c6",starter:"Silver Boomerang",skills:["starDisc","blinkBurst"],skillNames:["จักรดารา","พริบตาระเบิด"],role:"ไกล / คล่องตัว",dmg:1.01,guard:.69,parry:.15}
};
const JOBS={
 duelist:{name:"DUELIST",desc:"Combo cancel เร็ว • Blade mastery",dmg:1.06,speed:14,guard:.58,parry:.15,types:["katana","greatsword","shieldblade"]},
 striker:{name:"STRIKER",desc:"Attack speed สูง • Gauntlet mastery",dmg:1.03,speed:24,guard:.66,parry:.13,types:["gauntlet","katana"]},
 vanguard:{name:"VANGUARD",desc:"HP/Guard สูง • Shield mastery",dmg:.96,speed:-18,guard:.26,parry:.20,types:["shieldblade","greatsword","katana"]},
 sentinel:{name:"SENTINEL",desc:"Parry/Shield specialist",dmg:.92,speed:-5,guard:.20,parry:.25,types:["shieldblade","katana","staff"]},
 arcanist:{name:"ARCANIST",desc:"Mana/Skill สูง แต่ basic เบา",dmg:.88,speed:4,guard:.62,parry:.14,types:["staff","katana"]},
 oracle:{name:"ORACLE",desc:"Support • Heal Pulse • Staff/Shield",dmg:.82,speed:7,guard:.48,parry:.18,types:["staff","shieldblade","bow"]}
};
const WEAPON_DB=[
 {name:"Training Katana",type:"katana",rarity:"common",power:1.00},
 {name:"Moonblade",type:"katana",rarity:"rare",power:1.16},{name:"Shiden Edge",type:"katana",rarity:"epic",power:1.32},{name:"Storm Sovereign",type:"katana",rarity:"legendary",power:1.52},
 {name:"Iron Breaker",type:"greatsword",rarity:"common",power:1.12},{name:"Titan Cleaver",type:"greatsword",rarity:"rare",power:1.26},{name:"Earthsplitter",type:"greatsword",rarity:"epic",power:1.46},
 {name:"Combat Knuckles",type:"gauntlet",rarity:"common",power:.96},{name:"Blaze Claws",type:"gauntlet",rarity:"rare",power:1.10},{name:"Oni Fists",type:"gauntlet",rarity:"epic",power:1.28},
 {name:"Oak Focus",type:"staff",rarity:"common",power:.88},{name:"Prism Staff",type:"staff",rarity:"rare",power:1.02},{name:"Astral Rod",type:"staff",rarity:"epic",power:1.18},
 {name:"Guard Saber",type:"shieldblade",rarity:"common",power:.98},{name:"Aegis Edge",type:"shieldblade",rarity:"rare",power:1.13},{name:"Paladin Crest",type:"shieldblade",rarity:"legendary",power:1.40},
 {name:"Night Fangs",type:"dualblades",rarity:"common",power:.94},{name:"Phantom Twins",type:"dualblades",rarity:"rare",power:1.08},{name:"Eclipse Pair",type:"dualblades",rarity:"epic",power:1.26},
 {name:"Hunter Bow",type:"bow",rarity:"common",power:.91},{name:"Sunpiercer",type:"bow",rarity:"rare",power:1.08},{name:"Starfall Bow",type:"bow",rarity:"legendary",power:1.38},
 {name:"Iron Maul",type:"hammer",rarity:"common",power:1.18},{name:"Thunder Maul",type:"hammer",rarity:"rare",power:1.34},{name:"Worldbreaker",type:"hammer",rarity:"legendary",power:1.64},
 {name:"Ash Spear",type:"spear",rarity:"common",power:1.03},{name:"Tempest Pike",type:"spear",rarity:"rare",power:1.20},{name:"Dragon Lance",type:"spear",rarity:"legendary",power:1.47},
 {name:"Apprentice Wand",type:"wand",rarity:"common",power:.84},{name:"Rune Wand",type:"wand",rarity:"rare",power:1.02},{name:"Celestial Wand",type:"wand",rarity:"epic",power:1.20},
 {name:"Bronze Chakram",type:"chakram",rarity:"common",power:.92},{name:"Storm Ring",type:"chakram",rarity:"rare",power:1.10},{name:"Void Halo",type:"chakram",rarity:"epic",power:1.29},
 {name:"Rift Axe",type:"axe",rarity:"common",power:1.16},{name:"Ember Axe",type:"axe",rarity:"rare",power:1.34},{name:"Titan Axe",type:"axe",rarity:"epic",power:1.52},
 {name:"Guard Halberd",type:"halberd",rarity:"common",power:1.08},{name:"Sky Halberd",type:"halberd",rarity:"rare",power:1.25},{name:"Royal Halberd",type:"halberd",rarity:"legendary",power:1.51},
 {name:"Silver Boomerang",type:"boomerang",rarity:"common",power:.93},{name:"Moon Boomerang",type:"boomerang",rarity:"rare",power:1.12},{name:"Nova Boomerang",type:"boomerang",rarity:"epic",power:1.31}
];
const RARITY={common:{color:"#d6d6d6",w:58},rare:{color:"#65a9ff",w:27},epic:{color:"#c176ff",w:12},legendary:{color:"#ffc857",w:3}};
const ELEMENTS={
 none:{name:"NEUTRAL",color:"#d6d6d6"},
 fire:{name:"FIRE",color:"#ff865f"},
 frost:{name:"FROST",color:"#8fdcff"},
 shock:{name:"SHOCK",color:"#ffe36d"},
 poison:{name:"POISON",color:"#72e56f"},
 void:{name:"VOID",color:"#d391ff"}
};
const ELITE_AFFIX={
 swift:{name:"SWIFT",color:"#7effc6"},
 armored:{name:"ARMORED",color:"#a9c7e6"},
 enraged:{name:"ENRAGED",color:"#ff7a66"},
 volatile:{name:"VOLATILE",color:"#d391ff"}
};
const SKILL_DB={
 duelist:[{id:"crescent",name:"Crescent Slash",desc:"Wide frontal slash"},{id:"iaido",name:"Iaido Step",desc:"Dash-cut with brief invulnerability"},{id:"bladeStorm",name:"Blade Storm",desc:"Multi-hit finisher"}],
 striker:[{id:"rush",name:"Flame Rush",desc:"Fast multi-hit rush"},{id:"uppercut",name:"Rising Upper",desc:"Launch enemy"},{id:"focus",name:"Focus Drive",desc:"Fast pressure skill"}],
 vanguard:[{id:"quake",name:"Earth Quake",desc:"High stagger ground smash"},{id:"guardRush",name:"Guard Rush",desc:"Protected forward bash"},{id:"ironWall",name:"Iron Wall",desc:"Heavy defensive skill"}],
 sentinel:[{id:"shieldWave",name:"Shield Wave",desc:"Push enemies away"},{id:"counter",name:"Counter Stance",desc:"Parry-focused skill"},{id:"aegis",name:"Aegis Field",desc:"Temporary protection"}],
 arcanist:[{id:"arcBurst",name:"Arc Burst",desc:"Three magic shots"},{id:"frostNova",name:"Frost Nova",desc:"Freeze nearby enemies"},{id:"voidLance",name:"Void Lance",desc:"Heavy ranged attack"}],
 oracle:[{id:"healPulse",name:"Heal Pulse",desc:"Heal self and allies"},{id:"sanctuary",name:"Sanctuary",desc:"Strong recovery pulse"},{id:"blessing",name:"Blessing",desc:"Support burst"}]
};
const MOVESET={
 katana:{hits:3,speed:[.34,.32,.43],mult:[1,1.08,1.48],range:[108,118,145],knock:[18,24,62],launch:[false,false,true],lunge:[14,18,28],charge:2.5},
 greatsword:{hits:3,speed:[.52,.48,.65],mult:[1.32,1.48,2.05],range:[128,145,180],knock:[42,55,95],launch:[false,true,true],lunge:[9,12,18],charge:3.2},
 gauntlet:{hits:4,speed:[.22,.20,.23,.34],mult:[.68,.72,.78,1.35],range:[76,78,82,105],knock:[8,10,12,45],launch:[false,false,false,true],lunge:[19,18,20,30],charge:2.1},
 staff:{hits:3,speed:[.40,.42,.55],mult:[.62,.68,1.02],range:[210,225,255],knock:[10,12,35],launch:[false,false,true],lunge:[3,3,5],charge:1.75},
 shieldblade:{hits:3,speed:[.42,.40,.50],mult:[.88,1.02,1.58],range:[92,103,125],knock:[14,20,60],launch:[false,false,true],lunge:[7,10,16],charge:2.35},
 dualblades:{hits:4,speed:[.19,.18,.20,.29],mult:[.62,.66,.72,1.22],range:[72,76,80,105],knock:[6,8,10,38],launch:[false,false,false,true],lunge:[22,22,23,34],charge:1.95},
 bow:{hits:3,speed:[.35,.33,.48],mult:[.68,.74,1.12],range:[260,285,330],knock:[8,10,34],launch:[false,false,true],lunge:[2,2,3],charge:2.15},
 hammer:{hits:3,speed:[.58,.56,.72],mult:[1.45,1.62,2.25],range:[120,138,170],knock:[48,64,110],launch:[false,true,true],lunge:[6,8,14],charge:3.45},
 spear:{hits:3,speed:[.36,.37,.50],mult:[.92,1.08,1.65],range:[145,160,205],knock:[16,24,68],launch:[false,false,true],lunge:[16,20,32],charge:2.65},
 wand:{hits:3,speed:[.34,.36,.50],mult:[.54,.62,.98],range:[245,270,310],knock:[6,8,24],launch:[false,false,false],lunge:[2,2,3],charge:1.85},
 chakram:{hits:3,speed:[.30,.30,.43],mult:[.68,.78,1.20],range:[220,245,285],knock:[8,11,34],launch:[false,false,true],lunge:[4,4,6],charge:2.05},
 axe:{hits:3,speed:[.48,.45,.60],mult:[1.20,1.38,1.95],range:[112,132,160],knock:[35,50,92],launch:[false,false,true],lunge:[8,10,17],charge:3.0},
 halberd:{hits:3,speed:[.40,.42,.56],mult:[1.02,1.18,1.72],range:[155,175,220],knock:[20,30,75],launch:[false,false,true],lunge:[14,18,28],charge:2.7},
 boomerang:{hits:3,speed:[.31,.33,.46],mult:[.68,.76,1.18],range:[230,260,310],knock:[8,10,30],launch:[false,false,true],lunge:[3,3,5],charge:2.0}
};
const WEAPON_SKILLS={
 katana:{name:"QUICK DRAW",cost:18},greatsword:{name:"EARTH CLEAVE",cost:22},gauntlet:{name:"METEOR FIST",cost:18},
 staff:{name:"ARC BEAM",cost:24},shieldblade:{name:"SHIELD BASH",cost:16},dualblades:{name:"PHANTOM RUSH",cost:18},
 bow:{name:"PIERCING SHOT",cost:18},hammer:{name:"SEISMIC SLAM",cost:24},spear:{name:"DRAGON THRUST",cost:18},
 wand:{name:"MANA NOVA",cost:22},chakram:{name:"RETURNING STORM",cost:20},axe:{name:"RIFT BREAKER",cost:23},halberd:{name:"SKY SWEEP",cost:21},boomerang:{name:"RETURN ARC",cost:19}
};

const ECFG={
 grunt:{sprite:"assets/enemies_v2/grunt.png",hp:60,spd:92,dmg:9,range:75,ai:"melee"},
 rogue:{sprite:"assets/enemies_v2/rogue.png",hp:42,spd:154,dmg:8,range:70,ai:"flank"},
 brute:{sprite:"assets/enemies_v2/brute.png",hp:132,spd:62,dmg:18,range:92,ai:"charge"},
 mage:{sprite:"assets/enemies_v2/mage.png",hp:50,spd:74,dmg:10,range:320,ai:"mage"},
 archer:{sprite:"assets/enemies_v2/archer.png",hp:48,spd:88,dmg:11,range:390,ai:"archer"},
 shield:{sprite:"assets/enemies_v2/shield.png",hp:112,spd:68,dmg:13,range:82,ai:"shield"},
 beast:{sprite:"assets/enemies_v2/beast.png",hp:82,spd:142,dmg:14,range:94,ai:"pounce"},
 spearman:{sprite:"assets/enemies_v2/spearman.png",hp:72,spd:105,dmg:13,range:125,ai:"melee"},
 warlock:{sprite:"assets/enemies_v2/warlock.png",hp:58,spd:78,dmg:14,range:350,ai:"mage"},
 crawler:{sprite:"assets/enemies_v2/crawler.png",hp:68,spd:168,dmg:12,range:82,ai:"pounce"},
 warden:{sprite:"assets/enemies_v2/warden.png",hp:138,spd:64,dmg:16,range:88,ai:"shield"}
};
const BOSSES=[
 {name:"ONI BEAST",sprite:"assets/bosses/oni_beast.png",hp:760,dmg:22,spd:92,kind:"oni_beast"},
 {name:"STONE TITAN",sprite:"assets/bosses/stone_titan.png",hp:980,dmg:28,spd:55,kind:"stone_titan"},
 {name:"VOID COLOSSUS",sprite:"assets/bosses/void_colossus.png",hp:900,dmg:25,spd:72,kind:"void_colossus"},
 {name:"WYRM",sprite:"assets/bosses/wyrm.png",hp:820,dmg:24,spd:108,kind:"wyrm"}
];
const STAGES=[
 {name:"NEON ALLEY",img:"assets/stages/neon_alley.png"},{name:"BAMBOO RUINS",img:"assets/stages/bamboo_ruins.png"},
 {name:"CRIMSON FORT",img:"assets/stages/crimson_fort.png"},{name:"VOID TEMPLE",img:"assets/stages/void_temple.png"}
];
const HROWS={idle:[0,4,5],run:[1,6,11],jump:[2,4,8],attack1:[3,6,16],attack2:[4,6,16],attack3:[5,6,14],skill:[6,6,13],block:[7,3,8],hit:[8,2,9],death:[9,6,7],ultimate:[10,8,14]};
const EROWS={idle:[0,4,5],run:[1,6,10],attack:[2,6,11],block:[3,3,8],hit:[4,2,9],death:[5,6,7]};
const BROWS={idle:[0,4,4],run:[1,6,8],attack:[2,6,9],skill:[3,6,9],hit:[4,2,7],death:[5,6,6]};

const images={};
function li(k,s){return new Promise(r=>{const i=new Image();i.onload=()=>{images[k]=i;r()};i.onerror=()=>r();i.src=s})}
async function loadAssets(){
 const j=[];Object.entries(HEROES).forEach(([k,v])=>["classic","royal","ember"].forEach(c=>j.push(li(`h_${k}_${c}`,`assets/heroes_hd/${k}_${c}.png`))));
 Object.entries(ECFG).forEach(([k,v])=>j.push(li("e_"+k,v.sprite.replace("enemies_v2/","enemies_hd/"))));
 BOSSES.forEach((b,i)=>j.push(li("b_"+i,b.sprite.replace("bosses/","bosses_hd/"))));STAGES.forEach((s,i)=>j.push(li("s_"+i,s.img.replace("stages/","stages_gen/"))));
 Object.keys(MOVESET).forEach(t=>j.push(li("w_"+t,"assets/weapons_hd/"+t+".png")));
 j.push(li("item_hp","assets/items160/potion_hp.png"),li("item_mp","assets/items160/potion_mp.png"),li("item_ult","assets/items160/potion_ult.png"));
 await Promise.all(j)
}

const Audio=(()=>{
 let ac,master,music,sfx,drums,bass,lead,pad,timer=null,on=true,stage=-1,mode="battle",step=0,nextTime=0,intensity=.72;
 const THEMES=[
  {name:"NEON RUSH",root:110,bpm:152,scale:[0,3,5,7,10,12],bass:[0,0,3,0,5,3,0,-2],lead:[12,15,17,19,17,15,12,10,12,15,19,22,19,17,15,12]},
  {name:"BAMBOO CHASE",root:98,bpm:144,scale:[0,2,3,7,8,12],bass:[0,0,7,3,0,5,3,0],lead:[12,14,15,19,15,14,12,10,12,15,20,19,15,14,12,7]},
  {name:"CRIMSON DRIVE",root:82.41,bpm:158,scale:[0,1,3,5,7,8,10,12],bass:[0,0,1,0,7,5,3,1],lead:[12,13,15,17,19,20,19,17,15,13,12,15,19,22,20,19]},
  {name:"VOID TEMPLE",root:73.42,bpm:148,scale:[0,2,3,5,7,8,11,12],bass:[0,0,3,0,7,3,8,7],lead:[12,14,15,19,20,19,15,14,12,15,19,23,20,19,15,11]}
 ];
 const semi=(root,n)=>root*Math.pow(2,n/12);
 function ensure(){
   if(ac)return ac;const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ac=new C();
   master=ac.createGain();music=ac.createGain();sfx=ac.createGain();drums=ac.createGain();bass=ac.createGain();lead=ac.createGain();pad=ac.createGain();
   const comp=ac.createDynamicsCompressor();comp.threshold.value=-15;comp.knee.value=12;comp.ratio.value=5;comp.attack.value=.006;comp.release.value=.18;
   master.gain.value=.92;music.gain.value=.68;sfx.gain.value=.82;
   drums.gain.value=1.0;bass.gain.value=.82;lead.gain.value=.53;pad.gain.value=.30;
   drums.connect(music);bass.connect(music);lead.connect(music);pad.connect(music);music.connect(comp);sfx.connect(comp);comp.connect(master);master.connect(ac.destination);
   return ac
 }
 async function unlock(){const c=ensure();if(c&&c.state==="suspended")try{await c.resume()}catch(_){}}
 function osc(f,when,d=.08,type="square",g=.05,out=sfx,slide=null){
   if(!on||!ensure())return;const o=ac.createOscillator(),gg=ac.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(20,f),when);
   if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),when+d);
   gg.gain.setValueAtTime(.0001,when);gg.gain.exponentialRampToValueAtTime(Math.max(.0002,g),when+.006);gg.gain.exponentialRampToValueAtTime(.0001,when+d);
   o.connect(gg);gg.connect(out);o.start(when);o.stop(when+d+.03)
 }
 function noiseAt(when,d=.06,g=.05,out=sfx,highpass=0){
   if(!on||!ensure())return;const n=Math.max(1,Math.floor(ac.sampleRate*d)),b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);
   for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
   const src=ac.createBufferSource(),gg=ac.createGain();src.buffer=b;gg.gain.setValueAtTime(g,when);gg.gain.exponentialRampToValueAtTime(.0001,when+d);
   if(highpass){const f=ac.createBiquadFilter();f.type="highpass";f.frequency.value=highpass;src.connect(f);f.connect(gg)}else src.connect(gg);
   gg.connect(out);src.start(when);src.stop(when+d+.02)
 }
 function tone(f,d=.08,type="square",g=.05,out=sfx,slide){const t=ensure()?.currentTime||0;osc(f,t,d,type,g,out,slide)}
 function noise(d=.06,g=.06){const t=ensure()?.currentTime||0;noiseAt(t,d,g,sfx)}
 function kick(t,strong=1){osc(145,t,.13,"sine",.16*strong,drums,42);osc(58,t,.08,"triangle",.06*strong,drums,38)}
 function snare(t,strong=1){noiseAt(t,.11,.10*strong,drums,850);osc(180,t,.055,"triangle",.035*strong,drums,105)}
 function hat(t,open=false){noiseAt(t,open?.09:.032,(open?.030:.018)*(0.5+intensity*.65),drums,4800)}
 function bassNote(f,t,d=.12,g=.07){osc(f,t,d,"square",g,bass);osc(f*.5,t,d*.9,"triangle",g*.42,bass)}
 function leadNote(f,t,d=.08,g=.04){osc(f,t,d,"square",g,lead);osc(f*2,t,d*.62,"sine",g*.20,lead)}
 function chord(root,t,d=.45,g=.018){[0,3,7].forEach((n,i)=>osc(semi(root,n+12),t,d,"triangle",g*(i?0.72:1),pad))}
 function attack(t,combo=0){unlock();if(t==="greatsword"||t==="hammer"||t==="axe"){tone(135,.11,"sawtooth",.11,sfx,55);noise(.08,.07)}else if(t==="gauntlet"){tone(105,.06,"square",.09,sfx,68);noise(.04,.07)}else if(["staff","wand"].includes(t)){tone(430+combo*80,.11,"sine",.055,sfx,800+combo*100);tone(900,.05,"triangle",.025)}else{tone(720,.06,"square",.08,sfx,260);noise(.035,.035)}}
 function impact(heavy=false){noise(heavy?.11:.06,heavy?.12:.085);tone(heavy?82:105,heavy?.12:.07,"square",heavy?.09:.055,sfx,55)}
 function guard(parry=false){tone(parry?1100:420,parry?.13:.06,"triangle",parry?.09:.05,sfx,parry?520:260);noise(.035,.035)}
 function jump(second=false){tone(second?360:260,.12,"square",.04,sfx,second?720:510)}
 function enemy(){tone(90,.10,"sawtooth",.055,sfx,55)}
 function pickup(){tone(520,.07,"sine",.045);setTimeout(()=>tone(780,.08,"sine",.045),50)}
 function scheduleStep(t){
   const th=THEMES[((stage%THEMES.length)+THEMES.length)%THEMES.length],bar=step%16,beat=bar%4;
   const isBoss=mode==="boss",isRest=mode==="rest",bpm=isBoss?Math.min(174,th.bpm+14):isRest?96:th.bpm;
   const root=isBoss?th.root*.9439:th.root;
   // drums
   if(!isRest){
     if(bar===0||bar===8||(intensity>.72&&(bar===6||bar===14)))kick(t,isBoss?1.25:1);
     if(bar===4||bar===12)snare(t,isBoss?1.2:1);
     if(bar%2===0||intensity>.78)hat(t,bar===14);
   }else if(bar===0||bar===8){hat(t,true)}
   // bass
   if(isRest){
     if(bar%4===0)bassNote(semi(root,th.bass[(bar/2)%th.bass.length]-12),t,.36,.032)
   }else if(bar%2===0||isBoss){
     const n=th.bass[Math.floor(bar/2)%th.bass.length]+(isBoss&&bar%4===2?3:0);
     bassNote(semi(root,n-12),t,isBoss?.16:.13,isBoss?.095:.072)
   }
   // lead / arpeggio
   const density=isBoss?1:intensity;
   if(isRest){
     if(bar%2===0)leadNote(semi(root,th.scale[(bar/2)%th.scale.length]+12),t,.18,.022)
   }else if(bar%2===0 || (density>.82&&bar%2===1)){
     const note=th.lead[bar%th.lead.length]+(isBoss&&bar%4===3?5:0);
     leadNote(semi(root,note),t,isBoss?.105:.075,isBoss?.052:.037)
   }
   if(bar===0||bar===8)chord(root,t,isRest?.72:.34,isRest?.014:.012);
   step++;
   return 60/bpm/4
 }
 function scheduler(){
   if(!ac||!on)return;
   while(nextTime<ac.currentTime+.12)nextTime+=scheduleStep(nextTime);
 }
 async function run(i,m="battle"){
   stop();stage=i;mode=m;step=0;if(!on)return;await unlock();if(!ac||ac.state!=="running")return;
   nextTime=ac.currentTime+.045;scheduler();timer=setInterval(scheduler,25);updateBgmLabel()
 }
 function updateBgmLabel(){
   const el=document.getElementById("bgmMode");if(!el)return;
   const th=THEMES[((stage%THEMES.length)+THEMES.length)%THEMES.length];
   el.textContent=mode==="boss"?`BOSS • ${th.name}`:mode==="rest"?`REST • ${th.name}`:`BATTLE • ${th.name}`
 }
 async function startMusic(i){return run(i,"battle")}
 function setMode(m,i=stage){if(m===mode&&i===stage&&timer)return;return run(i,m)}
 function setIntensity(v){
   intensity=Math.max(.25,Math.min(1,Number(v)||.6));
   if(lead)lead.gain.setTargetAtTime(.34+intensity*.20,ac.currentTime,.08);
   if(drums)drums.gain.setTargetAtTime(.68+intensity*.27,ac.currentTime,.08)
 }
 function stop(){if(timer)clearInterval(timer);timer=null}
 function toggle(){on=!on;if(master)master.gain.value=on?.92:.0001;if(on&&stage>=0)run(stage,mode);else stop();return on}
 return{unlock,attack,impact,guard,jump,enemy,pickup,startMusic,setMode,setIntensity,stop,toggle}
})()
window.addEventListener("pointerdown",()=>{Audio.unlock().catch(()=>{})},{once:true,capture:true});
;

let selectedHero="ronin",selectedMode="adventure",selectedCostume="classic",player,enemies=[],drops=[],projectiles=[],effects=[],wave=1,stageIndex=0,stageWave=1,running=false,last=0,supplyTimer=8,screenShake=0,hitStop=0,flash=0;
const keys={},joy={active:false,id:null,x:0,y:0,cx:0,cy:0};

let holdingAttack=false,holdTime=0,holdingSkill=false,skillHold=0,skillChargePulse=0,prevJ=false,blocking=false,parry=0,comboHits=0,comboExpire=0,levelPause=false,teamEnergy=0;
let stageMode="combat",stageCleared=false,exitHold=0,restTab="stats",nearbyPickup=null,stageObjects=[],inputSeq=[],heldObject=null,enemySeq=0;

const NET={
 enabled:false,socket:null,roomCode:"",playerId:"",isHost:false,peers:new Map(),lastSend:0,lastWorld:0,serverUrl:"",ready:false,ping:0,lastPingAt:0,reconnectToken:"",reconnectTimer:null,
 connect(url){return new Promise((resolve,reject)=>{try{this.serverUrl=url;localStorage.setItem("pixelBrawlerServerUrl",url);const s=new WebSocket(url);this.socket=s;s.onopen=()=>{this.startPing();resolve()};s.onerror=()=>reject(new Error("WebSocket connection failed"));s.onclose=()=>{if(this.enabled){showToast("CO-OP DISCONNECTED");this.enabled=false}};s.onmessage=e=>this.onMessage(JSON.parse(e.data))}catch(err){reject(err)}})},
 send(type,data={}){if(this.socket&&this.socket.readyState===1)this.socket.send(JSON.stringify({type,...data}))},
 startPing(){this.stopPing();this.lastPingAt=performance.now();this.pingTimer=setInterval(()=>{if(this.socket?.readyState===1){this.lastPingAt=performance.now();this.send("ping",{t:Date.now()})}},5000)},
 stopPing(){if(this.pingTimer)clearInterval(this.pingTimer);this.pingTimer=null},
 tryReconnect(){
   clearTimeout(this.reconnectTimer);
   if(!this.reconnectToken||!this.serverUrl)return;
   this.reconnectTimer=setTimeout(async()=>{try{await this.connect(this.serverUrl);this.send("reconnect",{token:this.reconnectToken});}catch{this.tryReconnect()}},1200)
 },
 onMessage(m){
   if(m.type==="room_joined"){this.enabled=true;this.roomCode=m.roomCode;this.playerId=m.playerId;this.isHost=m.isHost;this.reconnectToken=m.reconnectToken||this.reconnectToken;this.updateLobby(m.players||[]);onlineStatus(`เข้าห้อง ${m.roomCode} สำเร็จ`,"ok");showLobby();updateInviteLink()}
   else if(m.type==="reconnected"){this.enabled=true;this.roomCode=m.roomCode;this.playerId=m.playerId;this.isHost=m.isHost;this.updateLobby(m.players||[]);showToast("RECONNECTED");if(m.started&&m.world){applyWorldSnapshot(m.world);selectedMode="coop";startGame(true)}}
   else if(m.type==="error"){onlineStatus(m.message||"Game Server error","error");showToast(m.message||"SERVER ERROR")}
   else if(m.type==="room_players")this.updateLobby(m.players||[]);
   else if(m.type==="peer_state"){
     const old=this.peers.get(m.playerId)||{},now=performance.now(),dtp=Math.max(.016,Math.min(.25,(now-(old.receivedAt||now-85))/1000));
     const nvx=(m.state.x-(old.tx??m.state.x))/dtp,nvy=(m.state.y-(old.ty??m.state.y))/dtp,nvz=((m.state.z||0)-(old.tz??m.state.z??0))/dtp;
     this.peers.set(m.playerId,{...old,...m.state,tx:m.state.x,ty:m.state.y,tz:m.state.z,netVx:(old.netVx||0)*.45+nvx*.55,netVy:(old.netVy||0)*.45+nvy*.55,netVz:(old.netVz||0)*.45+nvz*.55,playerId:m.playerId,receivedAt:now})
   }
   else if(m.type==="peer_left")this.peers.delete(m.playerId);
   else if(m.type==="pong"){this.ping=Math.max(0,Math.round(performance.now()-this.lastPingAt));const el=$("pingText");if(el)el.textContent=`PING ${this.ping} ms`}
   else if(m.type==="ready_state"){this.updateLobby(m.players||[])}
   else if(m.type==="shared_loot"){spawnSharedLootVisual(m.loot)}
   else if(m.type==="loot_collected"){
     const d=drops.find(x=>x.sharedId===m.lootId);if(d){d.life=0;if(m.playerId===this.playerId){grantLootPayload(m.loot)}}
   }
   else if(m.type==="ally_downed"){const p=this.peers.get(m.playerId)||{};this.peers.set(m.playerId,{...p,downed:true,bleedout:m.bleedout||20})}
   else if(m.type==="ally_revived"){const p=this.peers.get(m.playerId)||{};this.peers.set(m.playerId,{...p,downed:false,respawning:false,hp:m.hp||40});if(m.playerId===this.playerId)reviveLocal(m.hp||40)}
   else if(m.type==="ally_respawning"){const p=this.peers.get(m.playerId)||{};this.peers.set(m.playerId,{...p,downed:false,respawning:true,respawnTimer:m.seconds||5})}
   else if(m.type==="ally_respawned"){const p=this.peers.get(m.playerId)||{};this.peers.set(m.playerId,{...p,downed:false,respawning:false,hp:m.hp||50,x:m.x||105,y:m.y||440,tx:m.x||105,ty:m.y||440})}
   else if(m.type==="assist"){showAssist(m.x,m.y,m.text||"CO-OP ASSIST")}
   else if(m.type==="support_pulse"){applySupportPulse(m.amount||18,false)}
   else if(m.type==="team_ult_request"&&this.isHost){triggerTeamUltimate()}
   else if(m.type==="team_ult"){applyTeamUltimateVisual(false)}
   else if(m.type==="host_changed"){this.isHost=m.playerId===this.playerId;this.updateHostButton()}
   else if(m.type==="start_match"){selectedMode="coop";startGame(true)}
   else if(m.type==="world_snapshot"&&!this.isHost)applyWorldSnapshot(m.world)
   else if(m.type==="remote_action"&&this.isHost)applyRemoteAction(m.playerId,m.action)
   else if(m.type==="error"){showToast(m.message||"NETWORK ERROR")}
 },
 updateLobby(players){
   const list=$("lobbyPlayers");if(!list)return;
   list.innerHTML=players.map(p=>`<div class="lobby-player ${p.ready?"ready":""}"><span class="dot"></span><div><b>${p.name||p.hero.toUpperCase()}</b><small>${p.hero.toUpperCase()}${p.isHost?" • HOST":""}</small></div><span class="ready-state ${p.ready?"yes":"no"}">${p.ready?"READY":"WAIT"}</span></div>`).join("");
   this.updateHostButton()
 },
 updateHostButton(){const b=$("startMatchBtn");if(!b)return;b.classList.toggle("hidden",!this.isHost);if(this.isHost){b.disabled=false;}},
 broadcastPlayer(now){
   if(!this.enabled||!player||now-this.lastSend<85)return;this.lastSend=now;
   this.send("player_state",{state:{x:player.x,y:player.y,z:player.z,facing:player.facing,hero:player.hero,costume:player.costume,state:player.state,frame:player.frame,stateTime:player.stateTime,attackStep:player.attackStep,attackStyle:player.attackStyle,weaponType:player.weapon.type,hp:player.hp,maxHp:player.maxHp,armor:player.armor,maxArmor:player.maxArmor,downed:player.downed||false,respawning:player.respawning||false}})
 },
 broadcastWorld(now){
   if(!this.enabled||!this.isHost||now-this.lastWorld<180)return;this.lastWorld=now;
   this.send("world_snapshot",{world:{wave,stageIndex,stageWave,teamEnergy,stageMode,stageCleared,enemies:enemies.filter(e=>!e.remove).map(e=>({id:e.id,boss:e.boss,bossIndex:e.bossIndex,type:e.type,x:e.x,y:e.y,z:e.z,facing:e.facing,hp:e.hp,maxHp:e.maxHp,armor:e.armor,maxArmor:e.maxArmor,ragdoll:e.ragdoll,state:e.state,stateTime:e.stateTime,frame:e.frame,dead:e.dead,deathTime:e.deathTime||0,ai:e.ai,pattern:e.pattern,elite:e.elite,affix:e.affix,status:e.status}))}})
 }
};


document.querySelectorAll(".hero-card").forEach(c=>c.onclick=()=>{document.querySelectorAll(".hero-card").forEach(x=>x.classList.remove("selected"));c.classList.add("selected");selectedHero=c.dataset.hero;renderHeroDetail()});
function renderHeroDetail(){
 const h=HEROES[selectedHero],el=$("heroDetail");if(!h||!el)return;
 const starter=WEAPON_DB.find(w=>w.name===h.starter),wt=starter?.type||"katana";
 el.innerHTML=`<div><b>${h.name} — ${h.tag}</b><span>${h.role}</span>
 <div class="meter"><i style="width:${Math.min(100,h.hp/1.7)}%"></i></div>
 <small>HP ${h.hp} • ATK ${h.atk} • SPEED ${h.speed}</small></div>
 <div><b>สกิลประจำตัว</b>
 <div class="skill-line"><i class="skill-pip">1</i><span>${h.skillNames[0]}</span></div>
 <div class="skill-line"><i class="skill-pip">2</i><span>${h.skillNames[1]}</span></div></div>
 <div><b>อาวุธเริ่มต้น</b><div class="weapon-mini"><img src="assets/weapons/${wt}.png"><span>${h.starter}</span></div>
 <small>เก็บอาวุธใหม่ในด่านเพื่อเปลี่ยน Moveset และ Weapon Skill</small></div>`
}
renderHeroDetail();
document.querySelectorAll(".costume-chip").forEach(b=>b.onclick=()=>{
 selectedCostume=b.dataset.costume;document.querySelectorAll(".costume-chip").forEach(x=>x.classList.toggle("selected",x===b));
 document.querySelectorAll(".hero-card").forEach(card=>{const img=card.querySelector("img");if(img)img.src=`assets/portraits_costumes/${card.dataset.hero}_${selectedCostume}.png`});
 renderHeroDetail()
});
document.querySelectorAll(".mode-card").forEach(c=>c.onclick=()=>{document.querySelectorAll(".mode-card").forEach(x=>x.classList.remove("selected"));c.classList.add("selected");selectedMode=c.dataset.mode;$("onlineSetup").classList.toggle("hidden",selectedMode!=="coop");$("offlineActions").classList.toggle("hidden",selectedMode==="coop")});
function defaultWsUrl(){
 const saved=localStorage.getItem("pixelBrawlerServerUrl");
 if(saved&&/^wss?:\/\//i.test(saved))return saved;
 if(location.protocol==="http:"||location.protocol==="https:"){
   const proto=location.protocol==="https:"?"wss:":"ws:";
   return `${proto}//${location.host}/ws`
 }
 return "ws://localhost:8081/ws"
}
function onlineStatus(text,type=""){
 const el=$("onlineStatus");if(!el)return;
 el.textContent=text;el.className=`online-status ${type}`.trim()
}
$("serverUrl").value=defaultWsUrl();
$("serverModeText").textContent=`Auto • ${defaultWsUrl()}`;
$("toggleServerBtn").onclick=()=>{$("serverAdvanced").classList.toggle("hidden")};

$("useAutoServerBtn").onclick=()=>{$("serverUrl").value=defaultWsUrl();onlineStatus(`ใช้ ${$("serverUrl").value}`,"ok")};
(function applyInviteFromUrl(){
 const q=new URLSearchParams(location.search),room=(q.get("room")||"").trim().toUpperCase(),server=(q.get("server")||"").trim();
 if(!room)return;
 selectedMode="coop";
 document.querySelectorAll(".mode-card").forEach(c=>c.classList.toggle("selected",c.dataset.mode==="coop"));
 $("onlineSetup").classList.remove("hidden");$("offlineActions").classList.add("hidden");
 $("joinCode").value=room;if(server)$("serverUrl").value=server;
 $("incomingInvite").classList.remove("hidden");$("incomingInviteText").textContent=`ห้อง ${room} • เลือกตัวละคร แล้วกด "เข้าห้อง"`;
 setTimeout(()=>$("onlineSetup").scrollIntoView({behavior:"smooth",block:"center"}),250)
})();
$("createRoomBtn").onclick=async()=>{
 Audio.unlock();const btn=$("createRoomBtn");btn.classList.add("loading");
 onlineStatus("กำลังเชื่อมต่อ Game Server...","connecting");
 try{
   await ensureNet();
   onlineStatus("เชื่อมต่อแล้ว • กำลังสร้างห้อง...","connecting");
   NET.send("create_room",{hero:selectedHero,name:HEROES[selectedHero].name});
   setTimeout(()=>{if(!NET.roomCode&&NET.socket?.readyState===1)onlineStatus("Server เชื่อมต่อแล้ว แต่ยังไม่ได้รับ Room Code","error")},4000)
 }catch(e){
   console.error(e);onlineStatus(friendlyNetError(e),"error")
 }finally{btn.classList.remove("loading")}
};
$("joinRoomBtn").onclick=async()=>{
 Audio.unlock();const code=$("joinCode").value.trim().toUpperCase(),btn=$("joinRoomBtn");
 if(!code){onlineStatus("กรุณาใส่รหัสห้องก่อน","error");return}
 btn.classList.add("loading");onlineStatus(`กำลังเข้าห้อง ${code}...`,"connecting");
 try{
   await ensureNet();NET.send("join_room",{roomCode:code,hero:selectedHero,name:HEROES[selectedHero].name})
 }catch(e){
   console.error(e);onlineStatus(friendlyNetError(e),"error")
 }finally{btn.classList.remove("loading")}
};
$("readyBtn").onclick=()=>{NET.ready=!NET.ready;$("readyBtn").classList.toggle("ready",NET.ready);$("readyBtn").textContent=NET.ready?"พร้อม ✓":"พร้อม";NET.send("set_ready",{ready:NET.ready})};
$("copyRoomBtn").onclick=()=>copyText(NET.roomCode,"คัดลอกรหัสห้องแล้ว");
$("copyInviteBtn").onclick=()=>copyText($("inviteLink").value,"คัดลอกลิงก์ชวนแล้ว");
$("shareInviteBtn").onclick=async()=>{
 const url=$("inviteLink").value;
 if(navigator.share){try{await navigator.share({title:"อัศวินจิ๋วผจญภัย",text:`มาตะลุยด่านด้วยกัน ห้อง ${NET.roomCode}`,url});return}catch(_){}}
 copyText(url,"คัดลอกลิงก์ชวนแล้ว")
};
$("leaveRoomBtn").onclick=()=>{NET.socket?.close();NET.stopPing();NET.enabled=false;$("lobby").classList.add("hidden");$("characterSelect").classList.remove("hidden")};
$("startMatchBtn").onclick=()=>{Audio.unlock();NET.send("start_match")};

function copyText(text,message){
 if(!text)return;
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>showToast(message)).catch(()=>fallbackCopy(text,message));return}
 fallbackCopy(text,message)
}
function fallbackCopy(text,message){
 const t=document.createElement("textarea");t.value=text;t.style.position="fixed";t.style.opacity="0";document.body.appendChild(t);t.select();
 try{document.execCommand("copy");showToast(message)}catch(_){showToast("คัดลอกไม่สำเร็จ")}t.remove()
}
function inviteUrl(){
 const base=location.origin+location.pathname;
 const q=new URLSearchParams({mode:"coop",room:NET.roomCode,server:NET.serverUrl});
 return `${base}?${q.toString()}`
}
function updateInviteLink(){
 const el=$("inviteLink");if(el&&NET.roomCode)el.value=inviteUrl()
}
function friendlyNetError(e){
 const url=$("serverUrl").value.trim();
 if(!url)return "ไม่พบ Game Server";
 if(location.hostname.endsWith("netlify.app")||location.hostname.endsWith("vercel.app")){
   return "หน้านี้เป็น Static hosting จึงสร้างห้องเองไม่ได้ • แนะนำ deploy ZIP v1.9.2 นี้บน Render/Railway แบบ Node แล้วเปิดเกมจาก URL นั้น"
 }
 if(e?.message==="timeout")return `เชื่อมต่อ ${url} ไม่ทันเวลา`;
 return `เชื่อมต่อ ${url} ไม่สำเร็จ`
}
async function pingGameServer(url){
 try{
   const httpUrl=url.replace(/^wss:/i,"https:").replace(/^ws:/i,"http:").replace(/\/ws(?:\?.*)?$/,"/health");
   const c=new AbortController(),to=setTimeout(()=>c.abort(),2500);
   const r=await fetch(httpUrl,{cache:"no-store",signal:c.signal});clearTimeout(to);
   if(!r.ok)return false;const j=await r.json().catch(()=>({}));return !!j.ok
 }catch(_){return false}
}
async function ensureNet(){
 let url=$("serverUrl").value.trim();
 if(!url){url=defaultWsUrl();$("serverUrl").value=url}
 if(!/^wss?:\/\//i.test(url))throw new Error("invalid websocket url");
 if(NET.socket&&NET.socket.readyState===1)return;
 const healthy=await pingGameServer(url);
 if(!healthy)console.warn("Health endpoint unavailable, trying WebSocket directly:",url);
 return await Promise.race([
   NET.connect(url),
   new Promise((_,reject)=>setTimeout(()=>reject(new Error("timeout")),5500))
 ])
}
function showLobby(){
 $("characterSelect").classList.add("hidden");$("gameWrap").classList.add("hidden");$("lobby").classList.remove("hidden");
 $("roomCodeText").textContent=NET.roomCode;NET.updateHostButton();updateInviteLink()
}

$("startBtn").onclick=()=>{Audio.unlock();startGame()};$("retryBtn").onclick=()=>{Audio.unlock();startGame()};$("selectBtn").onclick=back;$("menuBtn").onclick=back;
$("fullscreenBtn").onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch(_){}};
$("audioBtn").onclick=async()=>{await Audio.unlock();const on=Audio.toggle();$("audioBtn").classList.toggle("muted",!on);$("audioBtn").setAttribute("aria-label",on?"ปิดเสียง":"เปิดเสียง")};
window.addEventListener("keydown",e=>{
 const k=e.key.toLowerCase();keys[k]=true;
 if([" ","j","k","g"].includes(k))e.preventDefault()
});
window.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

function bind(id,fn){const el=$(id);if(el)el.addEventListener("pointerdown",e=>{e.preventDefault();fn()})}
bind("jumpBtn",jump);
const gw=$("gameWrap");["contextmenu","selectstart","dragstart"].forEach(ev=>gw?.addEventListener(ev,e=>e.preventDefault(),{passive:false}));
const sb=$("skillBtn");sb.addEventListener("pointerdown",e=>{e.preventDefault();holdingSkill=true;skillHold=0;skillChargePulse=0;sb.classList.add("charging");try{sb.setPointerCapture(e.pointerId)}catch(_){}});
["pointerup","pointercancel","lostpointercapture"].forEach(ev=>sb.addEventListener(ev,e=>{e.preventDefault();if(!holdingSkill)return;const held=skillHold;holdingSkill=false;skillHold=0;sb.classList.remove("charging");if(held>=.34)castChargedSkill(clamp((held-.34)/1.25,.20,1));else specialButton()}));
const ae=$("attackBtn");ae.addEventListener("pointerdown",e=>{e.preventDefault();classicAttack()});
const be=$("blockBtn");be.addEventListener("pointerdown",e=>{e.preventDefault();startGuard()});
["pointerup","pointercancel","pointerleave"].forEach(x=>be.addEventListener(x,e=>{e.preventDefault();stopGuard()}));

const jb=$("joystickBase"),jk=$("joystickKnob");
jb.addEventListener("pointerdown",e=>{e.preventDefault();const r=jb.getBoundingClientRect();joy.active=true;joy.id=e.pointerId;joy.cx=r.left+r.width/2;joy.cy=r.top+r.height/2;jb.classList.add("active");jb.setPointerCapture(e.pointerId);moveJoy(e)});
jb.addEventListener("pointermove",e=>{if(joy.active&&e.pointerId===joy.id){e.preventDefault();moveJoy(e)}});["pointerup","pointercancel","lostpointercapture"].forEach(v=>jb.addEventListener(v,e=>{joy.active=false;joy.x=joy.y=0;jk.style.transform="translate(-50%,-50%)";jb.classList.remove("active")}));
function moveJoy(e){const m=48,dx=e.clientX-joy.cx,dy=e.clientY-joy.cy,d=Math.hypot(dx,dy)||1,s=Math.min(1,m/d),x=dx*s,y=dy*s;joy.x=x/m;joy.y=y/m;jk.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`}

function starterWeapon(hero){return cloneWeapon(HEROES[hero]?.starter||"Training Katana")}
function cloneWeapon(name){const w=WEAPON_DB.find(x=>x.name===name)||WEAPON_DB[0],maxDur=w.type==="greatsword"||w.type==="hammer"?5:w.type==="staff"||w.type==="bow"?3:4;return{...w,id:Math.random().toString(36).slice(2),element:"none",durability:maxDur,maxDurability:maxDur,throwable:true}}
function createPlayer(){
 const h=HEROES[selectedHero],w=starterWeapon(selectedHero);
 return{hero:selectedHero,costume:selectedCostume,x:105,y:440,z:0,vz:0,jumps:0,facing:1,state:"idle",stateTime:0,frame:0,actionHit:false,attackStep:0,attackBuffer:0,attackLock:0,
 invuln:0,dead:false,maxHp:h.hp,hp:h.hp,maxMp:h.mp,mp:h.mp,maxArmor:Math.round(h.hp*.42+(w.type==="shieldblade"?34:0)),armor:Math.round(h.hp*.42+(w.type==="shieldblade"?34:0)),ult:0,baseAtk:h.atk,speed:h.speed,weapon:w,crit:.08,damageBonus:0,moveBonus:0,
 maxStamina:100,stamina:100,dashTime:0,dashVX:0,dashVY:0,lastMoveX:1,lastMoveY:0,status:{burn:0,burnDps:0,poison:0,poisonDps:0,frost:0},
 downed:false,bleedout:0,reviveProgress:0,potions:2,drinking:false,drinkTime:0,drinkHeal:0,respawning:false,respawnTimer:0,skillMode:"",pendingSkill:"",charge:0,chargeElement:"none",attackStyle:"horizontal"}
}
async function startGame(fromNetwork=false){
 if(window.GAME_BOOT)await window.GAME_BOOT.ready;await loadAssets();await Audio.unlock();
 player=createPlayer();NET.ready=false;teamEnergy=0;stageMode="combat";stageCleared=false;exitHold=0;enemies=[];drops=[];projectiles=[];effects=[];stageObjects=[];
 wave=1;stageIndex=0;stageWave=1;supplyTimer=12;comboHits=0;comboExpire=0;running=true;
 $("characterSelect").classList.add("hidden");$("lobby").classList.add("hidden");$("gameWrap").classList.remove("hidden");$("gameOver").classList.add("hidden");
 if(selectedMode==="bossrush")stageWave=3;spawnWaveFromRight();if(NET.enabled&&!NET.isHost)enemies=[];
 try{await window.ThreeFX?.init?.($("fx3d"))}catch(_){}
 await Audio.startMusic(stageIndex);last=performance.now();requestAnimationFrame(loop)
}
function back(){running=false;Audio.stop();$("coopHud")?.classList.add("hidden");$("downedOverlay")?.classList.add("hidden");$("gameWrap").classList.add("hidden");$("characterSelect").classList.remove("hidden")}
function loop(t){if(!running)return;NET.broadcastPlayer(t);NET.broadcastWorld(t);let dt=Math.min(.025,Math.max(.001,(t-last)/1000));last=t;interpolatePeers(dt);interpolateRemoteEnemies(dt);updateRevive(dt);const timeScale=hitStop>0?.28:1;if(hitStop>0)hitStop=Math.max(0,hitStop-dt);update(dt*timeScale);window.ThreeFX?.update?.(dt*timeScale);draw();requestAnimationFrame(loop)}

function job(){const h=HEROES[player.hero];return{dmg:h.dmg||1,speed:0,guard:h.guard??.58,parry:h.parry??.15}}
function moveData(){const m=MOVESET[player.weapon.type];return m}
function animInfo(s){let k=s;if(s.startsWith("attack"))k=s;return HROWS[k]||HROWS.idle}
function setState(o,s,force=false){if(!force&&o.state===s)return;o.state=s;o.stateTime=0;o.frame=0;o.actionHit=false}
function animUpdate(o,dt,rows=HROWS){o.stateTime+=dt;const a=rows[o.state]||rows.idle,n=a[1],fps=a[2],loop=["idle","run","jump","block"].includes(o.state);const raw=o.stateTime*fps,f=loop?(raw%n):Math.min(n-1,raw);o.animFrame=f;o.frame=Math.floor(f);o.animPhase=f-Math.floor(f);return{done:!loop&&o.stateTime>=n/fps,progress:Math.min(1,o.stateTime/(n/fps))}}


function interpolatePeers(dt){
 for(const p of NET.peers.values()){
   if(p.tx==null)continue;
   if(p.x==null){p.x=p.tx;p.y=p.ty;p.z=p.tz||0;continue}
   const lead=Math.min(.10,.025+(NET.ping||0)/2400),px=p.tx+(p.netVx||0)*lead,py=p.ty+(p.netVy||0)*lead,pz=(p.tz||0)+(p.netVz||0)*lead;
   const k=1-Math.exp(-18*dt);p.x+=(px-p.x)*k;p.y+=(py-p.y)*k;p.z+=(pz-p.z)*k;
   if(p.stateTime!=null)p.stateTime+=dt;
   const a=HROWS[p.state]||HROWS.idle,n=a[1],fps=a[2],loop=["idle","run","jump","block"].includes(p.state),raw=(p.stateTime||0)*fps;
   p.animFrame=loop?raw%n:Math.min(n-1,raw);p.frame=Math.floor(p.animFrame)
 }
 updateCoopHud()
}
function updateCoopHud(){
 const hud=$("coopHud"),wrap=$("coopPlayers");if(!hud||!wrap)return;
 if(!NET.enabled){hud.classList.add("hidden");return}
 hud.classList.remove("hidden");
 const rows=[{playerId:NET.playerId,name:HEROES[player?.hero]?.name||"YOU",hp:player?.hp||0,maxHp:player?.maxHp||1,downed:player?.downed},...Array.from(NET.peers.values()).filter(p=>p.playerId!==NET.playerId)];
 wrap.innerHTML=rows.map(p=>`<div class="coop-row ${p.downed?"downed":""}"><span class="name">${p.name||HEROES[p.hero]?.name||"ALLY"}${p.downed?" • DOWN":p.respawning?" • RESPAWN":""}</span><span class="mini-bar"><i style="width:${100*clamp((p.hp||0)/(p.maxHp||1),0,1)}%"></i></span></div>`).join("")
}
function updateRevive(dt){
 if(!NET.enabled||!player||player.downed)return;
 let target=null;
 for(const p of NET.peers.values()){
   if(p.playerId===NET.playerId||!p.downed)continue;
   if(Math.hypot((p.x||0)-player.x,(p.y||0)-player.y)<72){target=p;break}
 }
 const prompt=$("revivePrompt");
 if(target){
   prompt.classList.remove("hidden");
   target._revive=(target._revive||0)+dt;
   if(target._revive>=2.2){target._revive=0;NET.send("revive_player",{targetId:target.playerId});showAssist(target.x,target.y,"REVIVE!")}
 }else{
   prompt.classList.add("hidden");
   for(const p of NET.peers.values())p._revive=0;
 }
}
function enterDowned(){
 if(!NET.enabled){return false}
 player.downed=true;player.respawning=false;player.bleedout=15;player.hp=1;player.invuln=999;
 setState(player,"death",true);
 $("downedOverlay").classList.remove("hidden");
 NET.send("player_downed",{bleedout:15});
 return true
}
function reviveLocal(hp=40){
 if(!player)return;
 player.downed=false;player.bleedout=0;player.invuln=1;player.hp=Math.min(player.maxHp,hp);setState(player,"idle",true);$("downedOverlay").classList.add("hidden");showToast("REVIVED")
}
function beginRespawn(){
 player.downed=false;player.respawning=true;player.respawnTimer=5;player.invuln=999;setState(player,"death",true);
 NET.send("player_respawning",{seconds:5})
}
function finishRespawn(){
 player.respawning=false;player.respawnTimer=0;player.x=105;player.y=440;player.z=0;player.vz=0;player.jumps=0;
 player.hp=Math.max(1,Math.round(player.maxHp*.5));player.mp=Math.round(player.maxMp*.5);player.invuln=2;setState(player,"idle",true);
 $("downedOverlay").classList.add("hidden");NET.send("player_respawned",{hp:player.hp,x:player.x,y:player.y});showToast("RESPAWNED")
}
function spawnSharedLootVisual(loot){
 if(!loot)return;
 if(drops.some(d=>d.sharedId===loot.id))return;
 drops.push({type:loot.type,x:loot.x,y:loot.y,z:loot.z||80,life:20,item:loot.item||null,bob:Math.random()*6.2,sharedId:loot.id,shared:true,pendingPickup:false})
}
function showAssist(x,y,text){
 const r=canvas.getBoundingClientRect(),n=document.createElement("div");n.className="assist-pop";n.style.left=r.left+x*(r.width/1280)+"px";n.style.top=r.top+y*(r.height/720)+"px";n.textContent=text;$("gameWrap").appendChild(n);setTimeout(()=>n.remove(),900)
}

function awardRestPoints(){}
function showRestUI(){$("restBanner").classList.remove("hidden");$("stageGate").classList.remove("hidden");$("gateStatus").textContent=NET.enabled?"ทุกคนไปทางออก →":"ไปทางออก →"}
function hideRestUI(){$("restBanner").classList.add("hidden")}
function enterRestStage(){stageMode="rest";stageCleared=false;exitHold=0;enemies=[];projectiles=[];drops=[];stageObjects=[];player.x=105;player.y=440;player.hp=Math.min(player.maxHp,player.hp+Math.round(player.maxHp*.28));player.mp=player.maxMp;Audio.setMode("rest",stageIndex);showRestUI();showToast("พักฟื้นแล้ว • พร้อมไปต่อ")}
function leaveRestStage(){hideRestUI();stageMode="combat";stageCleared=false;exitHold=0;wave++;if(selectedMode==="bossrush"){stageWave=3;stageIndex=(stageIndex+1)%STAGES.length}else if(selectedMode==="survival"){stageWave=(stageWave%3)+1;if(stageWave===1)stageIndex=(stageIndex+1)%STAGES.length}else{if(stageWave>=3){stageWave=1;stageIndex=(stageIndex+1)%STAGES.length}else stageWave++}player.x=105;player.y=440;player.hp=Math.min(player.maxHp,player.hp+18);player.mp=player.maxMp;spawnWaveFromRight()}
function allPlayersAtExit(){if(player.x<1165||player.downed||player.respawning)return false;if(!NET.enabled)return true;for(const p of NET.peers.values()){if(p.playerId===NET.playerId)continue;if((p.x||0)<1165||p.downed||p.respawning)return false}return true}
function updateStageExit(dt){const gate=$("stageGate");if(!gate)return;if(stageMode==="combat"&&!stageCleared){gate.classList.add("hidden");return}gate.classList.remove("hidden");const ready=allPlayersAtExit();gate.classList.toggle("ready",ready);$("gateStatus").textContent=ready?"พร้อมไปต่อ":"ทุกคนไปทางออก →";if(NET.enabled&&!NET.isHost)return;if(ready){exitHold+=dt;if(exitHold>=.65){exitHold=0;if(stageMode==="rest")leaveRestStage();else enterRestStage()}}else exitHold=0}


function updatePlayerStatus(dt){
 const s=player?.status;if(!s)return;
 if(s.burn>0){s.burn-=dt;player._burnTick=(player._burnTick||0)-dt;if(player._burnTick<=0){player._burnTick=.55;const d=Math.max(1,s.burnDps*.55);player.hp-=d;showDamage(player.x,player.y-90,Math.round(d),"#ff865f")}}
 if(s.poison>0){s.poison-=dt;player._poisonTick=(player._poisonTick||0)-dt;if(player._poisonTick<=0){player._poisonTick=.70;const d=Math.max(1,s.poisonDps*.70);player.hp-=d;showDamage(player.x,player.y-90,Math.round(d),"#72e56f")}}
 s.frost=Math.max(0,(s.frost||0)-dt)
}

function update(dt){
 if(!player)return;
 if(player.downed){
   player.bleedout-=dt;$("downedMessage").textContent="เพื่อนชุบได้ • RESPAWN ถ้าหมดเวลา";$("bleedoutText").textContent="REVIVE "+Math.max(0,Math.ceil(player.bleedout))+"s";
   if(player.bleedout<=0)beginRespawn();
   updateHud();return
 }
 if(player.respawning){
   player.respawnTimer-=dt;$("downedMessage").textContent="กำลังกลับเข้าสนาม";$("bleedoutText").textContent="RESPAWN "+Math.max(0,Math.ceil(player.respawnTimer))+"s";
   if(player.respawnTimer<=0)finishRespawn();
   updateHud();return
 }flash=Math.max(0,flash-dt);screenShake=Math.max(0,screenShake-28*dt);updateDrinking(dt);updatePlayerStatus(dt);
 if(holdingSkill&&!blocking&&!player.drinking){skillHold=Math.min(1.75,skillHold+dt);skillChargePulse-=dt;if(skillChargePulse<=0){skillChargePulse=.085;const el=defaultChargeElement();effects.push({type:"chargeSpark",x:player.x+(Math.random()-.5)*55,y:player.y-player.z-25-Math.random()*80,vx:(Math.random()-.5)*30,vy:-20-Math.random()*50,life:.35,color:ELEMENTS[el].color,size:2+Math.random()*3})}}
player.invuln=Math.max(0,player.invuln-dt);player.attackBuffer=Math.max(0,player.attackBuffer-dt);player.mp=Math.min(player.maxMp,player.mp+5.5*dt);parry=Math.max(0,parry-dt);if(comboExpire>0){comboExpire-=dt;if(comboExpire<=0)resetCombo()}
 const ax=(keys["d"]||keys["arrowright"]?1:0)-(keys["a"]||keys["arrowleft"]?1:0)+joy.x, ay=(keys["s"]||keys["arrowdown"]?1:0)-(keys["w"]||keys["arrowup"]?1:0)+joy.y;
 const mx=Math.abs(ax)<.06?0:ax,my=Math.abs(ay)<.06?0:ay;
 const dirToken=Math.abs(mx)>Math.abs(my)?(mx>0?"R":mx<0?"L":""):(my>0?"D":my<0?"U":"");
 if(dirToken&&dirToken!==player._lastDirToken){pushInput(dirToken);player._lastDirToken=dirToken}
 if(!dirToken)player._lastDirToken="";
 player.lastMoveX=mx||player.lastMoveX||player.facing;player.lastMoveY=my||0;

 if(Math.abs(mx)>.08)player.facing=Math.sign(mx); // can turn even while attacking
 
 const jn=!!keys["j"];if(jn&&!prevJ)classicAttack();prevJ=jn;
 if(keys["g"]&&!blocking)startGuard();if(!keys["g"]&&blocking)stopGuard();

 const ai=animUpdate(player,dt,HROWS);
 const attacking=player.state.startsWith("attack");if(attacking&&player.stateTime<.20)player.x=clamp(player.x+player.facing*(player.attackDrive||55)*dt,55,1235);const locked=player.drinking||attacking||["skill","ultimate","hit","death"].includes(player.state);
 let moveScale=locked?.18:blocking?.42:1;
 if(mx||my){const l=Math.max(1,Math.hypot(mx,my)),dx=mx/l,dy=my/l;player.x+=dx*(player.speed+job().speed+player.moveBonus)*moveScale*dt;player.y+=dy*(player.speed+job().speed+player.moveBonus)*.68*moveScale*dt;if(!locked&&!blocking&&player.z<=0)setState(player,"run")}
 else if(!locked&&!blocking&&player.z<=0)setState(player,"idle");
 player.x=clamp(player.x,55,1235);player.y=clamp(player.y,225,625);
 if(blocking&&!locked)setState(player,"block");
 if(player.z>0||player.vz>0){player.vz-=900*dt;player.z+=player.vz*dt;if(player.z<=0){const landed=player.z<0||player.vz<0;player.z=0;player.vz=0;player.jumps=0;if(landed){for(let i=0;i<5;i++)effects.push({type:"dust",x:player.x+(Math.random()-.5)*26,y:player.y+7,vx:(Math.random()-.5)*65,vy:-15-Math.random()*28,life:.30,color:"#b9aa96",size:3+Math.random()*3})}if(!locked&&!blocking)setState(player,"idle")}}
 processPlayerAction(ai);
 if(keys["k"]){specialButton();keys["k"]=false}if(keys[" "]){jump();keys[" "]=false}

 if(!NET.enabled||NET.isHost){updateEnemies(dt);updateProjectiles(dt)} else {updateProjectiles(dt)} updateDrops(dt);updateEffects(dt);
 if(stageMode==="combat"){const alive=enemies.filter(e=>!e.dead).length,boss=enemies.some(e=>e.boss&&!e.dead);Audio.setIntensity(boss?1:Math.min(1,.48+alive*.055+comboHits*.012))}
 /* v2.3 loot only from enemies and breakables */
 updateHud();updateStageExit(dt);
 if(player.hp<=0&&!player.dead&&!player.downed){player.dead=true;setState(player,"death",true);setTimeout(()=>{running=false;$("gameOver").classList.remove("hidden")},650)}
 if((!NET.enabled||NET.isHost)&&enemies.every(e=>e.dead||e.remove)&&running&&stageMode==="combat"&&!stageCleared){stageCleared=true;$("stageGate").classList.remove("hidden");$("gateStatus").textContent=NET.enabled?"ทุกคนไปทางออก →":"ไปทางออก →";showToast("เคลียร์พื้นที่แล้ว → ไปทางขวา")}
}

function beginAttack(){if(!running||player.dead||blocking)return;holdingAttack=true;holdTime=0}
function releaseAttack(){if(!holdingAttack)return;holdingAttack=false;if(holdTime>.46)startCharge(Math.min(1,holdTime/1.2));else queueAttack();holdTime=0}
function queueAttack(){player.attackBuffer=.22;if(canStartAttack())startAttack((player.attackStep%moveData().hits)+1)}
function canStartAttack(){if(player.dead||blocking)return false;if(player.state.startsWith("attack")){const a=animInfo(player.state),dur=a[1]/a[2];return player.stateTime/dur>.53}return !["skill","ultimate","hit","death"].includes(player.state)}
function startAttack(step){const m=moveData();player.attackStep=step;player.attackStyle=step===1?"horizontal":step===2?"rising":(Math.random()<.52?"overhead":"reverse");player.attackBuffer=0;player.actionHit=false;setState(player,"attack"+Math.min(step,3),true);player.attackDrive=(m.lunge[step-1]||10)*(step>=3?6.2:5.0);if(step>=3)effects.push({type:"dust",x:player.x-player.facing*8,y:player.y+6,vx:-player.facing*45,vy:-18,life:.28,color:"#cbbfae",size:5});Audio.attack(player.weapon.type,step)}
function startCharge(c){if(!canStartAttack())return;player.skillMode="charge";player.charge=1+c*(moveData().charge-1);setState(player,"skill",true);player.actionHit=false;Audio.attack(player.weapon.type,3)}
function processPlayerAction(a){
 if(player.state.startsWith("attack")){
  const step=player.attackStep,m=moveData(),idx=step-1;
  const hitAt=step===1?.31:step===2?.36:.42;
  if(!player.actionHit&&a.progress>hitAt){player.actionHit=true;weaponStrike(step,m.mult[idx],m.range[idx],m.knock[idx],m.launch[idx]);if(step>=3){screenShake=Math.max(screenShake,7);hitStop=Math.max(hitStop,.018)}}
  if(a.progress>.55&&player.attackBuffer>0&&step<m.hits){startAttack(step+1);return}
  if(a.done){if(player.attackBuffer>0)startAttack(1);else setState(player,player.z>0?"jump":blocking?"block":"idle",true)}
 }else if(player.state==="skill"){
  if(!player.actionHit&&a.progress>.40){
   player.actionHit=true;
   if(player.skillMode==="charge"){weaponStrike(3,player.charge||2,moveData().range[Math.min(2,moveData().range.length-1)]*1.25,85,true,true);player.charge=0}
   else if(player.skillMode==="elementCharge"){executeChargedSkill()}
   else if(player.skillMode==="classicRush"){player.x=clamp(player.x+player.facing*44,55,1235);weaponStrike(3,1.65,175,58,false,true)}
   else if(player.skillMode==="classicLauncher"){weaponStrike(3,1.55,140,42,true,true);for(const e of enemies)if(Math.abs(e.x-player.x)<145&&Math.abs(e.y-player.y)<90){e.vz=300;e.z=Math.max(1,e.z)}}
   else if(player.skillMode==="classicHeavy"){weaponStrike(3,2.35,190,105,true,true);screenShake=10}
   else if(player.skillMode==="weapon")executeWeaponSkill();
   else executeJobSkill(player.pendingSkill);
  }
  if(a.done){player.skillMode="";player.pendingSkill="";setState(player,player.z>0?"jump":"idle",true)}
 }else if(player.state==="ultimate"){
  if(!player.actionHit&&a.progress>.42){player.actionHit=true;enemies.forEach(e=>{if(Math.hypot(e.x-player.x,e.y-player.y)<360)damageEnemy(e,player.baseAtk*player.weapon.power*4.4,90,true)});screenShake=12}
  if(a.done)setState(player,"idle",true)
 }else if(player.state==="hit"&&a.done)setState(player,"idle",true)
}

function emitWeaponFx(x,y,dir,type,color,heavy=false,style="horizontal"){
 const spread=heavy?18:10;
 effects.push({type:"slash",x:x+dir*18,y,life:heavy?.34:.24,color,dir,heavy,weaponType:type,style});
 for(let i=0;i<spread;i++){
  effects.push({type:"spark",x:x+dir*(10+Math.random()*28),y:y+(Math.random()-.5)*28,
    vx:dir*(90+Math.random()*180),vy:(Math.random()-.5)*150,life:.18+Math.random()*.22,
    color:i%3===0?"#ffffff":color,size:2+Math.random()*3})
 }
 if(["greatsword","hammer","axe","halberd"].includes(type))for(let i=0;i<10;i++)effects.push({type:"dust",x:x+dir*35,y:y+34,vx:(Math.random()-.5)*100,vy:-25-Math.random()*40,life:.35,color:"#d9c7aa",size:3+Math.random()*4});
}
function emitImpactFx(x,y,color,heavy=false){window.ThreeFX?.burst?.(x,y,color,heavy?"impactHeavy":"impact");
 effects.push({type:"impact",x,y,life:heavy?.30:.20,color,size:heavy?34:23});
 for(let i=0;i<(heavy?12:7);i++){
  const a=Math.random()*Math.PI*2,s=70+Math.random()*(heavy?250:150);
  effects.push({type:"spark",x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.16+Math.random()*.20,color:i%4===0?"#fff":color,size:2+Math.random()*3})
 }
}
function emitSkillFx(kind,x,y,dir,color){window.ThreeFX?.burst?.(x,y,color,kind);
 effects.push({type:"rune",x:x+dir*22,y:y-12,life:.46,color,radius:kind==="magic"?64:48});
 if(kind==="dash")for(let i=0;i<5;i++)effects.push({type:"after",x:x-dir*i*18,y:y-i*2,life:.16+i*.025,color});
 if(kind==="magic")for(let i=0;i<10;i++){const a=i*Math.PI*2/10;effects.push({type:"spark",x:x+Math.cos(a)*35,y:y+Math.sin(a)*26,vx:Math.cos(a)*70,vy:Math.sin(a)*70,life:.35,color,size:3})}
}

function weaponStrike(step,mult,range,knock,launch,charged=false){
 let dmg=player.baseAtk*player.weapon.power*job().dmg*(1+player.damageBonus)*mult;
 if(NET.enabled&&!NET.isHost){
   NET.send("combat_action",{action:{kind:["staff","bow","wand","chakram","boomerang"].includes(player.weapon.type)?"projectile":"strike",x:player.x,y:player.y,facing:player.facing,damage:dmg,range,knock,launch,weaponType:player.weapon.type,color:HEROES[player.hero].color,element:player.weapon.element||"none"}});
 }
 if(["staff","bow","wand","chakram","boomerang"].includes(player.weapon.type)){
   if(["staff","wand"].includes(player.weapon.type)){if(player.mp<2&&!charged){showToast("มานาไม่พอ");return}if(!charged)player.mp-=2;}
   const shots=step===3?3:1;for(let i=0;i<shots;i++)spawnPlayerShot(dmg*(shots>1?.72:1),(i-(shots-1)/2)*.13);return
 }
 const cx=player.x+player.facing*range*.50;emitWeaponFx(cx,player.y-player.z-28,player.facing,player.weapon.type,ELEMENTS[player.weapon.element||"none"]?.color||HEROES[player.hero].color,charged||["greatsword","hammer"].includes(player.weapon.type),player.attackStyle||"horizontal");
 if(NET.enabled&&!NET.isHost)return;
 for(const e of enemies){if(e.dead)continue;const okx=Math.abs(e.x-cx)<range*.58,oky=Math.abs(e.y-player.y)<95;if(okx&&oky){damageEnemy(e,dmg,player.facing*knock,charged||step>=3);if(launch||player.z>20){e.vz=230;e.z=Math.max(1,e.z)}}}
 for(const o of stageObjects){if(o.dead)continue;if(Math.abs(o.x-cx)<range*.58&&Math.abs(o.y-player.y)<92)damageStageObject(o,dmg,player.facing*knock)}
}
function spawnPlayerShot(dmg,spread=0){projectiles.push({owner:"player",weaponType:player.weapon.type,x:player.x+player.facing*34,y:player.y-player.z-30,vx:player.facing*520,vy:spread*300,life:1.1,dmg,r:8,color:(ELEMENTS[player.weapon.element||"none"]?.color||HEROES[player.hero].color),pierce:0,element:player.weapon.element||"none"})}
function quickUsePotion(){
 if(!player||player.potions<=0)return showToast("ไม่มียา");
 if(player.hp>=player.maxHp)return showToast("HP เต็มแล้ว");
 if(player.drinking||player.dead||player.downed)return;
 player.potions--;player.drinking=true;player.drinkTime=.78;player.drinkHeal=Math.round(player.maxHp*.42);setState(player,"block",true);showToast("กำลังดื่มยา...")
}
function updateDrinking(dt){
 if(!player?.drinking)return;
 player.drinkTime-=dt;
 if(player.drinkTime<=0){
  player.drinking=false;player.hp=Math.min(player.maxHp,player.hp+player.drinkHeal);player.drinkHeal=0;
  Audio.pickup();effects.push({type:"ring",x:player.x,y:player.y-player.z-20,life:.34,color:"#83ff9e",radius:48});
  setState(player,"idle",true);showToast("+ ยาฟื้นฟู")
 }
}
function throwWeapon(){
 if(!player||player.dead||player.downed||blocking||player.drinking)return;
 const w=player.weapon,starter=HEROES[player.hero].starter;
 if(!w?.throwable||w.name===starter)return showToast("อาวุธประจำตัวปาไม่ได้");
 const dmg=player.baseAtk*w.power*job().dmg*2;
 projectiles.push({owner:"player",weaponType:w.type,x:player.x+player.facing*35,y:player.y-player.z-32,vx:player.facing*610,vy:-20,life:1.15,dmg,r:14,color:"#e7e7e7",pierce:0,element:w.element||"none",thrownWeapon:w,returnDrop:true});
 player.weapon=starterWeapon(player.hero);showToast(`ปา ${w.name}`)
}
function breakWeapon(w){if(player.weapon?.id===w.id)player.weapon=starterWeapon(player.hero);showToast("อาวุธพัง!")}

function pushInput(token){
 const now=performance.now();inputSeq.push({token,t:now});
 inputSeq=inputSeq.filter(x=>now-x.t<820).slice(-7)
}
function seqEnds(pattern){
 const now=performance.now(),arr=inputSeq.filter(x=>now-x.t<800).map(x=>x.token);
 if(arr.length<pattern.length)return false;
 return pattern.every((p,i)=>arr[arr.length-pattern.length+i]===p)
}
function clearSeq(){inputSeq=[]}
function classicAttack(){
 if(!running||player.dead||player.downed||blocking||player.drinking)return;
 pushInput("A");

 if(player.z>24){
   if(heldObject){throwHeldObject();clearSeq();return}
   if(seqEnds(["R","J","A"])||seqEnds(["L","J","A"])){aerialDriveAttack();clearSeq();return}
   aerialAttack();return
 }

 // Consumables are used with the same attack button after being picked up.
 if(heldObject&&["potion","heal","mana","ult"].includes(heldObject.type)){useHeldObject();clearSeq();return}

 // Attack becomes PICK when standing close to a ground item.
 const d=nearbyPickup;
 if(d&&d.z===0&&!d.pendingPickup){takeGroundItem(d);clearSeq();return}

 // Direction commands.
 if(seqEnds(["L","R","D","A"])||seqEnds(["R","L","D","A"])){heavyCommandAttack();clearSeq();return}
 if(seqEnds(["L","R","A"])||seqEnds(["R","L","A"])){rushCommandAttack();clearSeq();return}
 if(seqEnds(["D","R","A"])||seqEnds(["D","L","A"])){launcherCommandAttack();clearSeq();return}
 queueAttack()
}
function takeGroundItem(d){
 d.pendingPickup=true;
 if(d.shared&&NET.enabled){NET.send("collect_loot",{lootId:d.sharedId});return}
 d.life=0;nearbyPickup=null;grantLootPayload(d)
}
function rushCommandAttack(){
 if(!canStartAttack())return;
 player.skillMode="classicRush";player.pendingSkill="";player.actionHit=false;player.invuln=.12;player.attackDrive=390;
 setState(player,"skill",true);Audio.attack(player.weapon.type,2);emitSkillFx("dash",player.x,player.y-player.z-28,player.facing,HEROES[player.hero].color)
}
function launcherCommandAttack(){
 if(!canStartAttack())return;
 player.skillMode="classicLauncher";player.pendingSkill="";player.actionHit=false;
 setState(player,"skill",true);Audio.attack(player.weapon.type,3)
}
function heavyCommandAttack(){
 if(!canStartAttack())return;
 player.skillMode="classicHeavy";player.pendingSkill="";player.actionHit=false;
 setState(player,"skill",true);Audio.attack(player.weapon.type,3)
}
function aerialAttack(){
 if(["hit","death","ultimate"].includes(player.state))return;
 player.attackStep=2;player.actionHit=false;setState(player,"attack2",true);Audio.attack(player.weapon.type,2)
}
function aerialDriveAttack(){
 if(["hit","death","ultimate"].includes(player.state))return;
 player.attackStep=3;player.actionHit=false;player.x=clamp(player.x+player.facing*24,55,1235);
 setState(player,"attack3",true);Audio.attack(player.weapon.type,3);emitSkillFx("dash",player.x,player.y-player.z-25,player.facing,HEROES[player.hero].color)
}
function useHeldObject(){
 const h=heldObject;if(!h)return;
 if(h.type==="potion"||h.type==="heal"){
   if(player.hp>=player.maxHp)return showToast("HP เต็มแล้ว");
   heldObject=null;player.drinking=true;player.drinkTime=.72;player.drinkHeal=Math.round(player.maxHp*(h.type==="potion"?.42:.30));
   setState(player,"block",true);showToast("กำลังดื่มยา...");return
 }
 if(h.type==="mana"){heldObject=null;player.mp=Math.min(player.maxMp,player.mp+42);Audio.pickup();showToast("+ มานา");return}
 if(h.type==="ult"){heldObject=null;player.ult=Math.min(100,player.ult+34);Audio.pickup();showToast("+ พลังไม้ตาย")}
}
function throwHeldObject(){
 const h=heldObject;if(!h)return;heldObject=null;
 if(h.type==="weapon"&&h.item){
   const w=h.item,dmg=player.baseAtk*w.power*job().dmg*2;
   projectiles.push({owner:"player",weaponType:w.type,x:player.x+player.facing*30,y:player.y-player.z-28,vx:player.facing*610,vy:-18,life:1.2,dmg,r:14,color:"#e8e8e8",pierce:0,element:w.element||"none",thrownWeapon:w,returnDrop:true});
   player.weapon=starterWeapon(player.hero);showToast(`ปา ${w.name}`);return
 }
 const dmg=player.baseAtk*1.35;
 projectiles.push({owner:"player",weaponType:"item",x:player.x+player.facing*22,y:player.y-player.z-22,vx:player.facing*520,vy:20,life:.95,dmg,r:10,color:"#d9d9d9",pierce:0,element:"none"});
 showToast("ปาของ!")
}
function specialButton(){
 if(!running||player.dead||player.downed||blocking||player.drinking)return;
 pushInput("S");
 if(seqEnds(["D","D","S"])&&player.ult>=100){ultimate();clearSeq();return}
 if(seqEnds(["D","S"])){jobSkill(1);clearSeq();return}
 if(seqEnds(["R","S"])||seqEnds(["L","S"])){weaponSkill();clearSeq();return}
 jobSkill(0)
}


function defaultChargeElement(){
 const e=player.weapon?.element;if(e&&e!=="none")return e;
 if(["ember","grom"].includes(player.hero))return"fire";
 if(["arcane","nami"].includes(player.hero))return"frost";
 if(["lyra","faye"].includes(player.hero))return"poison";
 if(["kira","sora"].includes(player.hero))return"shock";
 return"void"
}
function castChargedSkill(charge){
 if(!running||blocking||player.drinking||["skill","ultimate","hit","death"].includes(player.state))return;
 const cost=Math.round(18+charge*14);if(player.mp<cost)return showToast("มานาไม่พอ");
 player.mp-=cost;player.skillMode="elementCharge";player.pendingSkill="";player.charge=.85+charge*1.65;player.chargeElement=defaultChargeElement();
 setState(player,"skill",true);Audio.attack(player.weapon.type,3);
 effects.push({type:"chargeBurst",x:player.x,y:player.y-player.z-36,life:.48,color:ELEMENTS[player.chargeElement].color,radius:70+charge*55});
 window.ThreeFX?.burst?.(player.x,player.y-player.z-34,ELEMENTS[player.chargeElement].color,player.chargeElement==="frost"?"ice":player.chargeElement==="shock"?"lightning":player.chargeElement==="void"?"dark":"fire")
}
function executeChargedSkill(){
 const el=player.chargeElement||defaultChargeElement(),c=player.charge||1,power=player.baseAtk*player.weapon.power*job().dmg*(1+player.damageBonus),cx=player.x+player.facing*(120+55*c),cy=player.y;
 if(el==="fire"){
   for(const e of enemies)if(!e.dead&&Math.hypot(e.x-cx,(e.y-cy)*1.3)<150+45*c){damageEnemy(e,power*(1.20+.55*c),player.facing*(45+30*c),true,"fire");applyElementStatus(e,"fire",power*c)}
   for(let i=-2;i<=2;i++)effects.push({type:"firePillar",x:cx+i*52,y:cy+Math.abs(i)*8,life:.65,color:"#ff6b35",size:70+25*c});screenShake=8+4*c
 }else if(el==="frost"){
   for(const e of enemies)if(!e.dead&&Math.hypot(e.x-cx,(e.y-cy)*1.2)<165+50*c){damageEnemy(e,power*(.95+.42*c),player.facing*24,true,"frost");applyElementStatus(e,"frost",power*c)}
   for(let i=-3;i<=3;i++)effects.push({type:"iceSpike",x:cx+i*42,y:cy+Math.abs(i)*6,life:.78,color:"#9de6ff",size:58+30*c});screenShake=5+3*c
 }else if(el==="poison"){
   for(const e of enemies)if(!e.dead&&Math.hypot(e.x-cx,(e.y-cy)*1.1)<180+55*c){damageEnemy(e,power*(.65+.30*c),player.facing*18,false,"poison");applyElementStatus(e,"poison",power*c)}
   effects.push({type:"poisonCloud",x:cx,y:cy-30,life:1.35,color:"#72e56f",radius:155+55*c})
 }else if(el==="shock"){
   const targets=enemies.filter(e=>!e.dead).sort((a,b)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(b.x-cx,b.y-cy)).slice(0,Math.round(3+3*c));
   for(const e of targets)if(Math.hypot(e.x-cx,e.y-cy)<360){damageEnemy(e,power*(.82+.32*c),player.facing*20,true,"shock");applyElementStatus(e,"shock",power*c);effects.push({type:"lightningBolt",x:e.x,y:e.y-e.z-42,life:.28,color:"#cde8ff"})}
   flash=.10;screenShake=6
 }else{
   for(const e of enemies)if(!e.dead&&Math.hypot(e.x-cx,(e.y-cy)*1.2)<190+55*c){damageEnemy(e,power*(1.1+.48*c),player.facing*(35+35*c),true,"void");e.x=clamp(e.x-player.facing*20*c,45,1235)}
   effects.push({type:"voidRift",x:cx,y:cy-30,life:.85,color:"#bd7cff",radius:140+60*c});screenShake=7
 }
 player.charge=0
}

function jobSkill(slot=0){
 if(!running||blocking||player.drinking||["skill","ultimate","hit","death"].includes(player.state))return;
 const h=HEROES[player.hero],id=h.skills?.[slot];if(!id)return;
 const cost=slot===0?18:24;if(player.mp<cost)return showToast("มานาไม่พอ");
 player.mp-=cost;player.skillMode="hero";player.pendingSkill=id;setState(player,"skill",true);Audio.attack(player.weapon.type,slot+1)
}
function skill(){jobSkill(0)}
function skill2(){jobSkill(1)}
function executeJobSkill(id){
 emitSkillFx(["arcBurst","frostNova","voidLance","healPulse","sanctuary","blessing"].includes(id)?"magic":"dash",player.x,player.y-player.z-28,player.facing,HEROES[player.hero].color);
 const lv=1,power=player.baseAtk*player.weapon.power*job().dmg*(1+player.damageBonus);
 if(id==="healPulse"){applySupportPulse(24+lv*5,true);if(NET.enabled)NET.send("support_pulse",{amount:24+lv*5});return}
 if(id==="sanctuary"){applySupportPulse(34+lv*7,true);effects.push({type:"ring",x:player.x,y:player.y-20,life:.6,color:"#89ffd0",radius:150});return}
 if(id==="blessing"){player.ult=Math.min(100,player.ult+22+lv*3);player.mp=Math.min(player.maxMp,player.mp+14);showToast("BLESSING");return}
 if(id==="iaido"){player.x=clamp(player.x+player.facing*(115+lv*10),55,1235);player.invuln=.28;weaponStrike(2,1.65+lv*.12,180,65,false,true);return}
 if(id==="bladeStorm"){for(const e of enemies)if(Math.hypot(e.x-player.x,e.y-player.y)<155)damageEnemy(e,power*(1.35+lv*.12),(e.x>player.x?1:-1)*38,true);effects.push({type:"ring",x:player.x,y:player.y-25,life:.38,color:HEROES[player.hero].color,radius:145});return}
 if(id==="crescent"){weaponStrike(3,1.55+lv*.12,210,65,true,true);return}
 if(id==="rush"){player.x=clamp(player.x+player.facing*(120+lv*8),55,1235);weaponStrike(3,1.45+lv*.12,145,52,false,true);return}
 if(id==="uppercut"){weaponStrike(3,1.65+lv*.14,115,45,true,true);for(const e of enemies)if(Math.abs(e.x-player.x)<120&&Math.abs(e.y-player.y)<85){e.vz=285;e.z=1}return}
 if(id==="focus"){player.mp=Math.min(player.maxMp,player.mp+20);player.invuln=.35;showToast("FOCUS DRIVE");return}
 if(id==="quake"){for(const e of enemies)if(Math.hypot(e.x-player.x,e.y-player.y)<185)damageEnemy(e,power*(1.7+lv*.14),(e.x>player.x?1:-1)*75,true);screenShake=9;return}
 if(id==="guardRush"){player.invuln=.45;player.x=clamp(player.x+player.facing*100,55,1235);weaponStrike(3,1.35+lv*.1,140,80,false,true);return}
 if(id==="ironWall"){player.invuln=.9+lv*.12;showToast("IRON WALL");return}
 if(id==="shieldWave"){weaponStrike(3,1.25+lv*.1,195,105,false,true);return}
 if(id==="counter"){blocking=true;parry=.45+lv*.05;$("blockBtn").classList.add("active");setTimeout(()=>stopGuard(),650);return}
 if(id==="aegis"){player.invuln=1+lv*.1;effects.push({type:"ring",x:player.x,y:player.y-20,life:.55,color:"#9fffe4",radius:75});return}
 if(id==="arcBurst"){for(let i=-1;i<=1;i++)spawnPlayerShot(power*(.88+lv*.06),i*.16);return}
 if(id==="frostNova"){for(const e of enemies)if(Math.hypot(e.x-player.x,e.y-player.y)<150){damageEnemy(e,power*(.72+lv*.05),25,false,"frost");applyElementStatus(e,"frost",power)}effects.push({type:"ring",x:player.x,y:player.y-20,life:.48,color:"#8fdcff",radius:145});return}
 if(id==="voidLance"){projectiles.push({owner:"player",x:player.x+player.facing*35,y:player.y-30,vx:player.facing*650,vy:0,life:1.2,dmg:power*(1.8+lv*.12),r:12,color:"#d391ff",pierce:2,element:"void"});return}
 if(id==="shadowDance"){player.invuln=.42;for(let i=0;i<3;i++){player.x=clamp(player.x+player.facing*34,55,1235);weaponStrike(2,.82,125,22,false,true)}return}
 if(id==="assassinate"){player.x=clamp(player.x+player.facing*145,55,1235);weaponStrike(3,2.25,140,68,true,true);return}
 if(id==="piercingVolley"){for(let i=-2;i<=2;i++){projectiles.push({owner:"player",weaponType:"bow",x:player.x+player.facing*32,y:player.y-30,vx:player.facing*(590+Math.abs(i)*25),vy:i*32,life:1.2,dmg:power*.68,r:6,color:"#e7e7e2",pierce:1,element:player.weapon.element||"none"})}return}
 if(id==="backstepShot"){player.x=clamp(player.x-player.facing*82,55,1235);player.invuln=.25;projectiles.push({owner:"player",weaponType:"bow",x:player.x+player.facing*32,y:player.y-30,vx:player.facing*700,vy:0,life:1.1,dmg:power*1.45,r:7,color:"#f0eee2",pierce:1,element:player.weapon.element||"none"});return}
 if(id==="windThrust"){player.x=clamp(player.x+player.facing*88,55,1235);weaponStrike(3,1.72,245,75,true,true);window.ThreeFX?.burst?.(player.x,player.y-28,"#d8edf0","wind");return}
 if(id==="cyclone"){for(const e of enemies)if(Math.hypot(e.x-player.x,e.y-player.y)<180)damageEnemy(e,power*1.35,(e.x>player.x?1:-1)*55,true,"frost");effects.push({type:"ring",x:player.x,y:player.y-25,life:.5,color:"#d8edf0",radius:170});window.ThreeFX?.burst?.(player.x,player.y-30,"#d8edf0","ring");return}
 if(id==="aquaBolt"){for(let i=-1;i<=1;i++)projectiles.push({owner:"player",weaponType:"wand",x:player.x,y:player.y-30,vx:player.facing*560,vy:i*45,life:1.15,dmg:power*.82,r:8,color:"#c7e8e3",pierce:0,element:"frost"});return}
 if(id==="healingRain"){applySupportPulse(34,true);if(NET.enabled)NET.send("support_pulse",{amount:28});window.ThreeFX?.burst?.(player.x,player.y-35,"#c6e3dc","heal");return}
 if(id==="rageSmash"){for(const e of enemies)if(Math.hypot(e.x-player.x,e.y-player.y)<190)damageEnemy(e,power*2.15,(e.x>player.x?1:-1)*105,true,"fire");screenShake=11;return}
 if(id==="ironCharge"){player.invuln=.35;player.dashTime=.28;player.dashVX=player.facing*620;player.dashVY=0;for(const e of enemies)if(Math.abs(e.x-player.x)<150&&Math.abs(e.y-player.y)<85)damageEnemy(e,power*1.4,player.facing*80,true);return}
 if(id==="starDisc"){for(let i=-1;i<=1;i++)projectiles.push({owner:"player",weaponType:"boomerang",x:player.x,y:player.y-30,vx:player.facing*520,vy:i*80,life:1.45,dmg:power*.9,r:12,color:"#e5dfc7",pierce:1,element:"shock"});return}
 if(id==="blinkBurst"){player.invuln=.32;player.dashTime=.22;player.dashVX=player.facing*720;player.dashVY=0;window.ThreeFX?.burst?.(player.x,player.y-30,"#ded9c6","blink");return}
 weaponStrike(3,1.45,moveData().range[2]||130,55,true,true)
}
function weaponSkill(){
 if(!running||blocking||player.drinking||["skill","ultimate","hit","death"].includes(player.state))return;
 const ws=WEAPON_SKILLS[player.weapon.type];if(!ws)return;
 if(player.mp<ws.cost)return showToast("มานาไม่พอ");
 player.mp-=ws.cost;player.skillMode="weapon";player.pendingSkill=player.weapon.type;setState(player,"skill",true);Audio.attack(player.weapon.type,3)
}
function executeWeaponSkill(){
 emitSkillFx(["staff","wand","bow","chakram"].includes(player.weapon.type)?"magic":"dash",player.x,player.y-player.z-28,player.facing,ELEMENTS[player.weapon.element||"none"]?.color||HEROES[player.hero].color);
 const t=player.weapon.type,power=player.baseAtk*player.weapon.power*job().dmg*(1+player.damageBonus);
 if(t==="katana"){player.x=clamp(player.x+player.facing*115,55,1235);weaponStrike(3,2.05,205,78,false,true)}
 else if(t==="greatsword"){for(const e of enemies)if(Math.hypot(e.x-player.x,e.y-player.y)<210)damageEnemy(e,power*2.35,(e.x>player.x?1:-1)*105,true);screenShake=10}
 else if(t==="gauntlet"){player.x=clamp(player.x+player.facing*95,55,1235);weaponStrike(4,2.0,120,55,true,true)}
 else if(t==="staff"){for(let i=-2;i<=2;i++)spawnPlayerShot(power*.62,i*.13)}
 else if(t==="shieldblade"){player.invuln=.5;weaponStrike(3,1.75,145,110,false,true)}
 else if(t==="dualblades"){player.x=clamp(player.x+player.facing*140,55,1235);weaponStrike(3,1.9,150,48,true,true)}
 else if(t==="bow"||t==="halberd"){projectiles.push({owner:"player",x:player.x+player.facing*35,y:player.y-30,vx:player.facing*720,vy:0,life:1.25,dmg:power*2.1,r:8,color:ELEMENTS[player.weapon.element||"none"].color,pierce:3,element:player.weapon.element||"none"})}
 else if(t==="hammer"){for(const e of enemies)if(Math.hypot(e.x-player.x,e.y-player.y)<195)damageEnemy(e,power*2.6,(e.x>player.x?1:-1)*120,true);screenShake=12}
 else if(t==="spear"){player.x=clamp(player.x+player.facing*135,55,1235);weaponStrike(3,2.15,250,80,true,true)}
 else if(t==="wand"){for(let i=0;i<7;i++){const a=(i-3)*.13;projectiles.push({owner:"player",x:player.x,y:player.y-30,vx:player.facing*500,vy:a*400,life:1,dmg:power*.55,r:7,color:"#c284ff",pierce:0,element:player.weapon.element||"void"})}}
 else if(t==="chakram"||t==="boomerang"){projectiles.push({owner:"player",weaponType:"chakram",x:player.x+player.facing*30,y:player.y-30,vx:player.facing*560,vy:0,life:1.5,dmg:power*1.8,r:15,color:"#e5e1d2",pierce:2,element:player.weapon.element||"shock"})}
 else if(t==="axe"){weaponStrike(3,2.35,175,115,true,true);screenShake=9}
 else if(t==="halberd"){weaponStrike(3,2.0,255,85,true,true)}
 else if(t==="boomerang"){for(let i=-1;i<=1;i++)projectiles.push({owner:"player",weaponType:"boomerang",x:player.x,y:player.y-30,vx:player.facing*570,vy:i*65,life:1.45,dmg:power*.88,r:13,color:"#e4e6e7",pierce:1,element:player.weapon.element||"shock"})}
}
function applySupportPulse(amount,localCast){
 if(!player)return;player.hp=Math.min(player.maxHp,player.hp+amount);player.armor=Math.min(player.maxArmor,(player.armor||0)+Math.round(amount*.35));
 if(localCast)showToast("HEAL PULSE");else showToast("+ ALLY HEAL");
 Audio.pickup();effects.push({type:"ring",x:player.x,y:player.y-player.z-20,life:.40,color:"#89ffd0",radius:85})
}
function triggerTeamUltimate(){
 if(teamEnergy<100)return;teamEnergy=0;
 player.hp=Math.min(player.maxHp,player.hp+Math.round(player.maxHp*.25));player.mp=Math.min(player.maxMp,player.mp+30);
 for(const e of enemies){if(!e.dead)damageEnemy(e,Math.max(35,e.maxHp*.12),(e.x>player.x?1:-1)*40,true,"void")}
 applyTeamUltimateVisual(true);
 if(NET.enabled&&NET.isHost)NET.send("team_ult_fire");
}
function applyTeamUltimateVisual(localHost){
 screenShake=10;flash=.15;effects.push({type:"ring",x:640,y:410,life:.70,color:"#ffe36d",radius:320});showToast("TEAM ULTIMATE!")
}
function ultimate(){if(!running||player.ult<100||blocking)return;player.ult=0;player.invuln=1;setState(player,"ultimate",true);Audio.impact(true)}
function jump(){if(!running||player.dead||player.jumps>=2)return;pushInput("J");player.jumps++;player.vz=player.jumps===1?430:390;player.z=Math.max(1,player.z);setState(player,"jump",true);Audio.jump(player.jumps===2);effects.push({type:"ring",x:player.x,y:player.y,life:.22,color:player.jumps===2?"#aef7ff":"#fff"})}
function dash(){/* ไม่มีปุ่ม Dash ในโหมดควบคุมแบบคลาสสิก */}
function startGuard(){
 if(!running||player.dead||player.downed||player.z>18)return;
 blocking=true;parry=Math.max(.12,job().parry||.12);
 player.attackBuffer=0;holdingAttack=false;setState(player,"block",true);
 $("blockBtn").classList.add("active");
 effects.push({type:"ring",x:player.x+player.facing*12,y:player.y-player.z-28,life:.16,color:"#d9edf2",radius:28});
 Audio.guard(false)
}
function stopGuard(){
 blocking=false;parry=0;$("blockBtn").classList.remove("active");
 if(player.state==="block")setState(player,player.z>0?"jump":"idle",true)
}


const BREAKABLE_TYPES={
 barrel:{hp:42,drop:.28,scale:.72},crate:{hp:50,drop:.38,scale:.76},stone_pillar:{hp:72,drop:.14,scale:.72},
 minecart:{hp:82,drop:.55,scale:.82},bush:{hp:28,drop:.12,scale:.70},ruin_pillar:{hp:65,drop:.16,scale:.72},
 vase:{hp:24,drop:.42,scale:.68},column:{hp:58,drop:.18,scale:.72},chest:{hp:76,drop:.90,scale:.82}
};
function spawnStageObjects(){
 stageObjects=[];
 const sets=[
  ["barrel","crate","vase","bush","chest"],
  ["crate","ruin_pillar","vase","bush","barrel"],
  ["barrel","stone_pillar","minecart","crate","chest"],
  ["column","vase","stone_pillar","crate","chest"]
 ];
 const list=sets[stageIndex%sets.length];
 for(let i=0;i<5;i++){
   const type=list[i],cfg=BREAKABLE_TYPES[type];
   stageObjects.push({id:Math.random().toString(36).slice(2),type,x:430+i*145+(Math.random()-.5)*45,y:330+(i%2)*120+Math.random()*55,hp:cfg.hp,maxHp:cfg.hp,dead:false,flash:0,scale:cfg.scale})
 }
}
function damageStageObject(o,dmg,knock=0){
 if(!o||o.dead)return;o.hp-=dmg;o.flash=.12;o.x=clamp(o.x+knock*.12,90,1180);Audio.impact(dmg>35);
 effects.push({type:"spark",x:o.x,y:o.y-28,vx:(Math.random()-.5)*80,vy:-60,life:.25,color:"#ffd08c"});
 if(o.hp<=0){
  o.dead=true;screenShake=Math.max(screenShake,4);effects.push({type:"ring",x:o.x,y:o.y-10,life:.30,color:"#ffd08c",radius:42});
  rollObjectDrop(o)
 }
}
function rollObjectDrop(o){
 const cfg=BREAKABLE_TYPES[o.type],r=Math.random();
 if(o.type==="chest"){
   if(r<.62)spawnDrop("weapon",o.x,o.y,randomWeapon(),70);else spawnDrop("potion",o.x,o.y,null,55);return
 }
 if(r>cfg.drop)return;
 const q=Math.random();
 if(q<.10)spawnDrop("weapon",o.x,o.y,randomWeapon(),65);
 else if(q<.48)spawnDrop("potion",o.x,o.y,null,50);
 else if(q<.68)spawnDrop("heal",o.x,o.y,null,50);
 else if(q<.86)spawnDrop("mana",o.x,o.y,null,50);
 else spawnDrop("ult",o.x,o.y,null,50)
}

function spawnWaveFromRight(){player.x=105;player.y=440;spawnWave()}
function spawnWave(){
 $("waveNo").textContent=wave;$("stageName").textContent=STAGES[stageIndex].name;
 if(stageWave===3){Audio.setMode("boss",stageIndex);const b=BOSSES[stageIndex%BOSSES.length];$("bossBanner").textContent=b.name;$("bossBanner").classList.remove("hidden");setTimeout(()=>$("bossBanner").classList.add("hidden"),1000);enemies.push(makeBoss(stageIndex));return}
 Audio.setMode("battle",stageIndex);
 const pools=[["grunt","rogue","archer","spearman"],["grunt","rogue","brute","beast","crawler"],["brute","mage","warlock","archer","shield","warden"],["rogue","mage","warlock","shield","beast","crawler","spearman"]],pool=pools[stageIndex],count=Math.min(4+wave,10);
 for(let i=0;i<count;i++)enemies.push(makeEnemy(pool[(Math.random()*pool.length)|0],1185+Math.random()*90,270+Math.random()*300))
}
function makeEnemy(type,x,y){
 const c=ECFG[type],eliteChance=Math.min(.34,.06+wave*.018),elite=Math.random()<eliteChance;
 const affixes=Object.keys(ELITE_AFFIX),affix=elite?affixes[(Math.random()*affixes.length)|0]:null;
 let hp=c.hp+wave*6,spd=c.spd+wave*1.2,dmg=c.dmg+wave*.65;
 if(affix==="swift")spd*=1.34;if(affix==="armored")hp*=1.65;if(affix==="enraged")dmg*=1.48;if(affix==="volatile"){hp*=1.18;dmg*=1.18}
 const armor=Math.round((elite?hp*.32:hp*.16)*(affix==="armored"?1.65:1));
 return{id:`e${++enemySeq}_${Math.random().toString(36).slice(2,6)}`,boss:false,type,x,y,z:0,vz:0,facing:-1,hp,maxHp:hp,armor,maxArmor:armor,spd,dmg,state:"idle",stateTime:0,frame:0,actionHit:false,attackCd:.3+Math.random(),dead:false,deathTime:0,remove:false,ai:c.ai,guard:false,elite,affix,ragdoll:null,status:{burn:0,burnDps:0,frost:0,freeze:0,shock:0,poison:0,poisonDps:0,void:0}}
}
function makeBoss(i){const b=BOSSES[i%BOSSES.length],hp=b.hp+wave*25,armor=Math.round(hp*.42);return{id:`b${++enemySeq}_${Math.random().toString(36).slice(2,6)}`,boss:true,bossIndex:i%BOSSES.length,type:b.kind,x:1190,y:420,z:0,vz:0,facing:-1,hp,maxHp:hp,armor,maxArmor:armor,spd:b.spd,dmg:b.dmg+wave,state:"idle",stateTime:0,frame:0,actionHit:false,attackCd:1,dead:false,deathTime:0,remove:false,ai:"boss",pattern:"",summonCd:6,ragdoll:null,status:{burn:0,burnDps:0,frost:0,freeze:0,shock:0,poison:0,poisonDps:0,void:0}}}
function eRows(e){return e.boss?BROWS:EROWS}
function eAnim(e,dt){e.stateTime+=dt;const rows=eRows(e),a=rows[e.state]||rows.idle,n=a[1],fps=a[2],loop=["idle","run","block"].includes(e.state);let f=Math.floor(e.stateTime*fps);e.frame=loop?f%n:Math.min(n-1,f);return{done:!loop&&e.stateTime>=n/fps,progress:Math.min(1,e.stateTime/(n/fps))}}
function updateEnemies(dt){
 for(const e of enemies){if(e.dead){
   e.deathTime=(e.deathTime||0)+dt;if(e.state!=="death")setState(e,"death",true);updateRagdoll(e,dt);eAnim(e,dt);if(e.deathTime>=1.38)e.remove=true;
   continue
 }
  updateEnemyStatus(e,dt);if(e.status?.freeze>0){setState(e,"block");eAnim(e,dt);continue}
  e.attackCd=Math.max(0,e.attackCd-dt);if(e.z>0||e.vz>0){e.vz-=760*dt;e.z+=e.vz*dt;if(e.z<=0){e.z=0;e.vz=0}}
  const a=eAnim(e,dt),dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1;e.facing=dx>=0?1:-1;
  if(e.state==="hit"){if(a.done)setState(e,"idle",true);continue}
  if(e.state==="attack"||e.state==="skill"){processEnemyAction(e,a);continue}
  if(e.boss){updateBossAI(e,dx,dy,d,dt);continue}
  const c=ECFG[e.type];
  if(e.ai==="flank"){const targetY=player.y+(Math.sign(e.y-player.y)||1)*65;if(d>75){e.x+=dx/d*e.spd*statusSpeed(e)*dt;e.y+=(targetY-e.y)*1.7*dt;setState(e,"run")}else if(e.attackCd<=0)enemyStart(e,"melee")}
  else if(e.ai==="charge"){if(d>125){e.x+=dx/d*e.spd*statusSpeed(e)*dt;e.y+=dy/d*e.spd*statusSpeed(e)*.55*dt;setState(e,"run")}else if(e.attackCd<=0)enemyStart(e,"heavy")}
  else if(e.ai==="mage"||e.ai==="archer"){const min=e.ai==="archer"?230:190,max=e.ai==="archer"?390:330;if(d<min){e.x-=dx/d*e.spd*statusSpeed(e)*dt;e.y-=dy/d*e.spd*statusSpeed(e)*.45*dt;setState(e,"run")}else if(d>max){e.x+=dx/d*e.spd*statusSpeed(e)*dt;e.y+=dy/d*e.spd*statusSpeed(e)*.45*dt;setState(e,"run")}else setState(e,"idle");if(d<430&&e.attackCd<=0)enemyStart(e,"ranged")}
  else if(e.ai==="shield"){const front=Math.sign(dx)===e.facing;if(d>92){e.x+=dx/d*e.spd*statusSpeed(e)*dt;e.y+=dy/d*e.spd*statusSpeed(e)*.5*dt;setState(e,"run")}else if(e.attackCd<=0)enemyStart(e,Math.random()<.45?"guardhit":"melee");else setState(e,"block")}
  else if(e.ai==="pounce"){if(d>165){e.x+=dx/d*e.spd*statusSpeed(e)*dt;e.y+=dy/d*e.spd*statusSpeed(e)*.6*dt;setState(e,"run")}else if(e.attackCd<=0)enemyStart(e,"pounce")}
  else{if(d>78){e.x+=dx/d*e.spd*statusSpeed(e)*dt;e.y+=dy/d*e.spd*statusSpeed(e)*.68*dt;setState(e,"run")}else if(e.attackCd<=0)enemyStart(e,"melee");else setState(e,"idle")}
 }
 enemies=enemies.filter(e=>!e.remove)
}
function enemyStart(e,pattern){e.pattern=pattern;e.actionHit=false;setState(e,pattern==="guardhit"?"skill":"attack",true);e.attackCd=999;Audio.enemy()}
function processEnemyAction(e,a){
 const c=e.boss?BOSSES[e.bossIndex]:ECFG[e.type];
 const wind=e.boss?.48:e.pattern==="heavy"?.55:e.pattern==="pounce"?.38:e.pattern==="ranged"?.48:.32;
 if(!e.actionHit&&a.progress>(wind/(wind+.45))){e.actionHit=true;
  if(e.boss)bossExecute(e);
  else if(e.pattern==="ranged"){const ang=Math.atan2(player.y-e.y,player.x-e.x),sp=e.type==="archer"?390:300;projectiles.push({owner:"enemy",src:e,x:e.x,y:e.y-28,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,life:1.8,dmg:e.dmg,r:e.type==="archer"?6:9,color:e.type==="archer"?"#ddf0aa":"#ff7bb4",element:e.type==="mage"?"frost":e.type==="warlock"?"poison":"none"})}
  else if(e.pattern==="pounce"){e.x=clamp(e.x+e.facing*115,50,1230);enemyMelee(e,105,84,e.dmg*1.2)}
  else if(e.pattern==="heavy"){enemyMelee(e,105,90,e.dmg*1.25);screenShake=6}
  else enemyMelee(e,80,72,e.dmg)}
 if(a.done){setState(e,"idle",true);e.attackCd=e.boss?.55:.55+Math.random()*.55}
}
function enemyMelee(e,range,height,dmg){const hx=e.x+e.facing*range*.5;if(Math.abs(player.x-hx)<range*.62&&Math.abs(player.y-e.y)<height&&player.z<55)takeHit(dmg,e.facing*28,e)}
function updateBossAI(e,dx,dy,d,dt){
 e.summonCd-=dt;const low=e.hp/e.maxHp<.55;
 if(e.summonCd<=0&&enemies.filter(x=>!x.boss&&!x.dead).length<4){e.pattern="summon";setState(e,"skill",true);e.actionHit=false;e.summonCd=low?6:9;return}
 if(d>135){e.x+=dx/d*e.spd*statusSpeed(e)*dt;e.y+=dy/d*e.spd*statusSpeed(e)*.52*dt;setState(e,"run")}else if(e.attackCd<=0){const r=Math.random();e.pattern=low?(r<.28?"claw":r<.53?"slam":r<.76?"burst":"dash"):(r<.45?"claw":r<.72?"slam":"burst");setState(e,e.pattern==="burst"?"skill":"attack",true);e.actionHit=false;e.attackCd=999}else setState(e,"idle")
}
function bossExecute(e){
 const b=BOSSES[e.bossIndex];
 if(e.pattern==="summon"){for(let i=0;i<2+(e.hp/e.maxHp<.5?1:0);i++){const types=e.bossIndex===1?["brute","shield"]:e.bossIndex===3?["beast","archer"]:["grunt","rogue","beast"];enemies.push(makeEnemy(types[(Math.random()*types.length)|0],clamp(e.x-120+i*90,80,1200),clamp(e.y-70+i*55,250,600)))}effects.push({type:"ring",x:e.x,y:e.y,life:.45,color:"#d69cff",radius:90});return}
 if(e.pattern==="slam"){effects.push({type:"ring",x:e.x,y:e.y,life:.45,color:"#ff9a69",radius:150});if(Math.hypot(player.x-e.x,player.y-e.y)<155&&player.z<60)takeHit(e.dmg*1.25,(player.x>e.x?1:-1)*40,e);screenShake=10}
 else if(e.pattern==="burst"){for(let i=-2;i<=2;i++)projectiles.push({owner:"enemy",src:e,x:e.x,y:e.y-36,vx:e.facing*(290+Math.abs(i)*35),vy:i*85,life:1.6,dmg:e.dmg*.72,r:12,color:"#ff9a69"})}
 else if(e.pattern==="dash"){e.x=clamp(e.x+e.facing*170,60,1220);enemyMelee(e,150,100,e.dmg*1.35);screenShake=8}
 else enemyMelee(e,125,100,e.dmg*1.15)
}

function takeHit(dmg,knock,source){
 if(player.invuln>0||player.dead)return;
 if(blocking){
  if(parry>0){parry=0;Audio.guard(true);if(source&&!source.dead){setState(source,"hit",true);source.attackCd=1.2}player.ult=Math.min(100,player.ult+16);effects.push({type:"ring",x:player.x,y:player.y-player.z-28,life:.28,color:"#aef7ff"});setState(player,"block",true);window.ThreeFX?.burst?.(player.x+player.facing*24,player.y-player.z-30,"#ffffff","impactHeavy");showDamage(player.x,player.y-80,"PARRY!","#eafcff");hitStop=.06;return}
  const reduction=(player.weapon.type==="shieldblade"?Math.min(job().guard,.18):Math.min(.72,job().guard||.60));
  let dealt=dmg*reduction;const absorb=Math.min(player.armor||0,dealt*.72);player.armor=Math.max(0,(player.armor||0)-absorb);dealt=Math.max(0,dealt-absorb*.78);player.hp-=dealt;player.mp=Math.max(0,player.mp-3);
  setState(player,"block",true);Audio.guard(false);screenShake=Math.max(screenShake,2);
  effects.push({type:"impact",x:player.x+player.facing*25,y:player.y-player.z-32,life:.20,color:"#d8edf2",size:24});
  window.ThreeFX?.burst?.(player.x+player.facing*24,player.y-player.z-32,"#d8edf2","impact");
  showDamage(player.x,player.y-80,`กัน -${Math.round(dealt)}`,"#d8edf2");
  if(source&&!source.dead)source.x=clamp(source.x-player.facing*10,35,1245);
  if(player.mp<=0){showToast("มานาหมด • การ์ดแตก");stopGuard()}
  return
 }
 const absorb=Math.min(player.armor||0,dmg*.48);player.armor=Math.max(0,(player.armor||0)-absorb);dmg=Math.max(0,dmg-absorb*.72);player.hp-=dmg;
 if(player.hp<=0&&NET.enabled){if(enterDowned())return}
 player.x=clamp(player.x+knock,55,1235);player.invuln=.34;setState(player,"hit",true);resetCombo();showDamage(player.x,player.y-80,Math.round(dmg),"#ff7777");Audio.impact(false);screenShake=6
}

function applyWorldSnapshot(w){
 if(!w)return;
 const prevMode=stageMode;wave=w.wave;stageIndex=w.stageIndex;stageWave=w.stageWave;teamEnergy=w.teamEnergy||0;stageMode=w.stageMode||"combat";stageCleared=!!w.stageCleared;
 if(prevMode!==stageMode){player.x=105;player.y=440;if(stageMode==="rest"){awardRestPoints();showRestUI()}else hideRestUI()}
 $("waveNo").textContent=wave;$("stageName").textContent=STAGES[stageIndex].name;
 const old=new Map(enemies.map((e,i)=>[e.id||`legacy_${i}`,e]));
 enemies=(w.enemies||[]).filter(s=>!(s.dead&&(s.deathTime||0)>=1.38)).map((s,i)=>{
   const key=s.id||`legacy_${i}`,prev=old.get(key);
   if(!prev)return{...s,x:s.x,y:s.y,z:s.z||0,tx:s.x,ty:s.y,tz:s.z||0,attackCd:.4,actionHit:false,remove:false};
   return{...prev,...s,tx:s.x,ty:s.y,tz:s.z||0,x:prev.x??s.x,y:prev.y??s.y,z:prev.z??s.z??0,attackCd:.4,actionHit:false,remove:false}
 })
}
function interpolateRemoteEnemies(dt){
 if(!NET.enabled||NET.isHost)return;
 for(const e of enemies){
   const k=1-Math.exp(-15*dt);
   if(e.tx!=null){e.x+=(e.tx-e.x)*k;e.y+=(e.ty-e.y)*k;e.z+=(e.tz-e.z)*k}
   if(e.dead){
     e.deathTime=(e.deathTime||0)+dt;const a=eRows(e).death||eRows(e).idle,n=a[1],fps=a[2],raw=e.deathTime*fps;
     e.animFrame=Math.min(n-1,raw);e.frame=Math.floor(e.animFrame)
   }else{
     e.stateTime=(e.stateTime||0)+dt;const rows=eRows(e),a=rows[e.state]||rows.idle,n=a[1],fps=a[2],loop=["idle","run","block"].includes(e.state),raw=e.stateTime*fps;
     e.animFrame=loop?raw%n:Math.min(n-1,raw);e.frame=Math.floor(e.animFrame)
   }
 }
 enemies=enemies.filter(e=>!(e.dead&&(e.deathTime||0)>=1.0))
}
function applyRemoteAction(playerId,a){
 const p=NET.peers.get(playerId);if(!p||!a)return;
 if(a.kind==="projectile"){
   projectiles.push({owner:"remote",x:p.x,y:p.y-p.z-30,vx:p.facing*520,vy:0,life:1.1,dmg:a.damage,r:8,color:a.color||"#fff",pierce:0,element:a.element||"none"});
 }else{
   const cx=p.x+p.facing*a.range*.5;
   effects.push({type:"slash",x:cx,y:p.y-p.z-28,life:.18,color:a.color||"#fff",dir:p.facing,heavy:false});
   for(const e of enemies){if(e.dead)continue;if(Math.abs(e.x-cx)<a.range*.58&&Math.abs(e.y-p.y)<95){damageEnemy(e,a.damage,p.facing*a.knock,false,a.element||"none");NET.send("assist_event",{x:e.x,y:e.y,text:"CO-OP HIT"});if(a.launch){e.vz=220;e.z=Math.max(1,e.z)}}}
 }
}

function startRagdoll(e,knock=0,heavy=false){e.ragdoll={vx:knock*(heavy?4.2:2.8),vy:(Math.random()-.5)*(heavy?95:55),vr:(Math.random()-.5)*(heavy?8:5),rot:0,spread:heavy?1.25:.85};e.vz=Math.max(e.vz||0,heavy?360:235);e.z=Math.max(1,e.z||0)}
function updateRagdoll(e,dt){const r=e.ragdoll;if(!r)return;e.x=clamp(e.x+r.vx*dt,30,1250);e.y=clamp(e.y+r.vy*dt,220,635);r.vx*=Math.pow(.09,dt);r.vy*=Math.pow(.10,dt);r.rot+=r.vr*dt;r.vr*=Math.pow(.18,dt);if(e.z>0||e.vz>0){e.vz-=980*dt;e.z+=e.vz*dt;if(e.z<=0){e.z=0;e.vz=-e.vz*.22;r.vr*=.55;if(Math.abs(e.vz)<45)e.vz=0}}}

function damageEnemy(e,dmg,knock,heavy=false,elementOverride=null){
 if(e.dead)return;
 const element=elementOverride||player?.weapon?.element||"none";
 if(!e.boss&&e.ai==="shield"&&e.state==="block"&&Math.sign(player.x-e.x)===e.facing){dmg*=.28;showDamage(e.x,e.y-80,"GUARD","#9bc7ff");Audio.guard(false)}else{
  const crit=Math.random()<player.crit;if(crit)dmg*=1.65;if(e.armor>0){const mul=(heavy||player.skillMode==="elementCharge")?1.45:1,ab=Math.min(e.armor,dmg*.52*mul);e.armor-=ab;dmg=Math.max(0,dmg-ab*.72);showDamage(e.x,e.y-e.z-102,`ARMOR -${Math.round(ab)}`,"#b9d7ef")}e.hp-=dmg;e.x=clamp(e.x+knock,35,1245);addCombo();showDamage(e.x,e.y-e.z-85,crit?`CRIT ${Math.round(dmg)}`:Math.round(dmg),crit?"#ffe46d":RARITY[player.weapon.rarity].color);Audio.impact(heavy||crit);hitStop=Math.max(hitStop,heavy?.020:.008);flash=crit?.07:.025;
  player.ult=Math.min(100,player.ult+dmg*.16);
  if(NET.enabled&&NET.isHost)teamEnergy=clamp(teamEnergy+dmg*.045,0,100);
  applyElementStatus(e,element,dmg);
  emitImpactFx(e.x,e.y-e.z-32,ELEMENTS[element]?.color||"#fff",heavy||crit);
  if(!e.boss)setState(e,"hit",true)
 }
 if(e.hp<=0){
 e.hp=0;e.dead=true;e.deathTime=0;setState(e,"death",true);startRagdoll(e,knock,heavy);
 emitEnemyDeathFx(e);
 if(e.affix==="volatile"){effects.push({type:"ring",x:e.x,y:e.y,life:.42,color:"#d391ff",radius:105});if(Math.hypot(player.x-e.x,player.y-e.y)<115)takeHit(14+wave*.7,(player.x>e.x?1:-1)*26,e)}
 dropFromEnemy(e);
 gainXp(e.boss?130:e.elite?42:e.type==="brute"?35:22)
}
}


function emitEnemyDeathFx(e){
 const c=e.boss?"#ff694f":e.elite?(ELITE_AFFIX[e.affix]?.color||"#e9d6ff"):"#d7dbe0";
 const count=e.boss?28:e.elite?18:11;
 effects.push({type:"deathBurst",x:e.x,y:e.y-e.z-32,life:e.boss?.55:.38,color:c,size:e.boss?58:36});
 for(let i=0;i<count;i++){
   const a=Math.random()*Math.PI*2,s=(e.boss?120:70)+Math.random()*(e.boss?300:170);
   effects.push({type:"shard",x:e.x+(Math.random()-.5)*18,y:e.y-e.z-35+(Math.random()-.5)*30,
     vx:Math.cos(a)*s,vy:Math.sin(a)*s-80,life:.28+Math.random()*.35,color:i%4===0?"#ffffff":c,size:2+Math.random()*4})
 }
 window.ThreeFX?.burst?.(e.x,e.y-e.z-28,c,e.boss?"impactHeavy":"dark")
}

function statusSpeed(e){return (e.status?.freeze||0)>0?0:(e.status?.frost||0)>0?.50:1}
function applyElementStatus(e,element,dmg){
 if(!e.status||element==="none")return;
 if(element==="fire"){e.status.burn=Math.max(e.status.burn,2.8);e.status.burnDps=Math.max(e.status.burnDps,dmg*.12);window.ThreeFX?.burst?.(e.x,e.y-e.z-35,"#ff8b5f","fire")}
 else if(element==="frost"){e.status.frost=Math.max(e.status.frost,2.8);e.status.freeze=Math.max(e.status.freeze,e.boss?.28:.82);e.armor=Math.max(0,(e.armor||0)-dmg*.18);window.ThreeFX?.burst?.(e.x,e.y-e.z-35,"#8fdcff","ice")}
 else if(element==="poison"){e.status.poison=Math.max(e.status.poison,4.5);e.status.poisonDps=Math.max(e.status.poisonDps,dmg*.11);window.ThreeFX?.burst?.(e.x,e.y-e.z-35,"#72e56f","poison")}
 else if(element==="shock"){e.status.shock=Math.max(e.status.shock,.55);window.ThreeFX?.burst?.(e.x,e.y-e.z-35,"#ffe36d","lightning");e.attackCd+=.18;if(Math.random()<.22){const other=enemies.find(x=>x!==e&&!x.dead&&Math.hypot(x.x-e.x,x.y-e.y)<150);if(other){other.hp-=dmg*.28;showDamage(other.x,other.y-80,Math.round(dmg*.28),ELEMENTS.shock.color);effects.push({type:"ring",x:other.x,y:other.y-25,life:.18,color:ELEMENTS.shock.color,radius:35})}}}
 else if(element==="void"){e.status.void=Math.max(e.status.void,1.6);player.ult=Math.min(100,player.ult+2.2);window.ThreeFX?.burst?.(e.x,e.y-e.z-35,"#b889ff","dark")}
}
function updateEnemyStatus(e,dt){
 if(!e.status)return;
 if(e.status.burn>0){e.status.burn-=dt;e._burnTick=(e._burnTick||0)-dt;if(e._burnTick<=0){e._burnTick=.45;const d=Math.max(1,e.status.burnDps*.45);e.hp-=d;showDamage(e.x,e.y-e.z-70,Math.round(d),ELEMENTS.fire.color);effects.push({type:"spark",x:e.x+(Math.random()-.5)*22,y:e.y-e.z-35,vx:0,vy:-35,life:.30,color:ELEMENTS.fire.color})}}
 if(e.status.poison>0){e.status.poison-=dt;e._poisonTick=(e._poisonTick||0)-dt;if(e._poisonTick<=0){e._poisonTick=.65;const d=Math.max(1,e.status.poisonDps*.65);e.hp-=d;showDamage(e.x,e.y-e.z-75,Math.round(d),ELEMENTS.poison.color)}}
 e.status.frost=Math.max(0,e.status.frost-dt);e.status.freeze=Math.max(0,(e.status.freeze||0)-dt);e.status.shock=Math.max(0,e.status.shock-dt);e.status.void=Math.max(0,e.status.void-dt);
 if(e.hp<=0&&!e.dead){e.dead=true;e.deathTime=0;setState(e,"death",true);startRagdoll(e,0,false);dropFromEnemy(e)}
}

function updateProjectiles(dt){for(const p of projectiles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.owner==="player"||p.owner==="remote"){for(const e of enemies){if(e.dead)continue;if(Math.hypot(p.x-e.x,p.y-(e.y-e.z-30))<28+p.r){damageEnemy(e,p.dmg,p.vx>0?18:-18,!!p.thrownWeapon,p.element||"none");if(p.thrownWeapon&&p.thrownWeapon.durability>0&&Math.random()<.35){p.thrownWeapon.durability--;if(p.thrownWeapon.durability<=0)breakWeapon(p.thrownWeapon)}p.life=0;break}}}else if(player.z<50&&Math.hypot(p.x-player.x,p.y-(player.y-player.z-30))<28+p.r){takeHit(p.dmg,p.vx>0?18:-18,p.src);if(p.element==="fire"){player.status.burn=Math.max(player.status.burn,2.2);player.status.burnDps=Math.max(player.status.burnDps,p.dmg*.08)}if(p.element==="poison"){player.status.poison=Math.max(player.status.poison,3.4);player.status.poisonDps=Math.max(player.status.poisonDps,p.dmg*.08)}if(p.element==="frost")player.status.frost=Math.max(player.status.frost,1.5);p.life=0}}projectiles=projectiles.filter(p=>p.life>0&&p.x>-80&&p.x<1360&&p.y>90&&p.y<760)}

function rarityRoll(){const n=Math.random()*100;return n<3?"legendary":n<15?"epic":n<42?"rare":"common"}
function randomWeapon(){
 const r=rarityRoll(),pool=WEAPON_DB.filter(w=>w.rarity===r),w=pool[(Math.random()*pool.length)|0]||WEAPON_DB[0];
 const chances=r==="legendary"?.92:r==="epic"?.72:r==="rare"?.46:.16;
 const els=["fire","frost","shock","poison","void"],element=Math.random()<chances?els[(Math.random()*els.length)|0]:"none";
 const maxDur=w.type==="greatsword"||w.type==="hammer"?5:w.type==="staff"||w.type==="bow"?3:4;
 return{...w,id:Math.random().toString(36).slice(2),element,durability:maxDur,maxDurability:maxDur,throwable:true}
}
function spawnDrop(type,x,y,item=null,z=220){
 if(type==="weapon"&&drops.filter(d=>d.type==="weapon"&&d.life>0).length>=3)return;
 if(type!=="weapon"&&drops.filter(d=>d.type!=="weapon"&&d.life>0).length>=6)return;
 const d={type,x,y,z,life:type==="weapon"?24:18,item,bob:Math.random()*6.2,pendingPickup:false};
 if(NET.enabled&&NET.isHost){d.sharedId=Math.random().toString(36).slice(2);d.shared=true;NET.send("shared_loot_spawn",{loot:{id:d.sharedId,type,x,y,z,item}})}
 drops.push(d)
}
function dropSupply(){const x=280+Math.random()*650,y=285+Math.random()*250,r=Math.random();spawnDrop(r<.18?"weapon":r<.40?"heal":r<.58?"mana":r<.82?"potion":"ult",x,y,r<.18?randomWeapon():null,270);showToast("เสบียงกำลังตก!")}
function dropFromEnemy(e){
 const r=Math.random();
 if(e.boss){spawnDrop("weapon",e.x,e.y,randomWeapon(),110);if(Math.random()<.7)spawnDrop("potion",e.x-35,e.y,null,65);return}
 const weaponChance=e.elite?.18:.06,itemChance=e.elite?.34:.20;
 if(r<weaponChance)spawnDrop("weapon",e.x,e.y,randomWeapon(),95);
 else if(r<weaponChance+itemChance){const q=Math.random();spawnDrop(q<.28?"heal":q<.50?"mana":q<.85?"potion":"ult",e.x,e.y,null,55)}
}
function updateDrops(dt){
 nearbyPickup=null;let best=999;
 for(const d of drops){
  d.life-=dt;d.bob+=dt*3;
  if(d.z>0){d.z-=245*dt;if(d.z<=0){d.z=0;effects.push({type:"ring",x:d.x,y:d.y,life:.24,color:dropColor(d)})}}
  if(d.z===0&&!d.pendingPickup){const dist=Math.hypot(player.x-d.x,player.y-d.y);if(dist<76&&dist<best){best=dist;nearbyPickup=d}}
 }
 drops=drops.filter(d=>d.life>0);updatePickupUI()
}
function grantLootPayload(d){
 if(!d)return;Audio.pickup();
 if(d.type==="weapon"&&d.item){
   receiveWeapon(d.item);return
 }
 heldObject={type:d.type,item:d.item||null};
 showToast(d.type==="potion"||d.type==="heal"?"ถือยาอยู่ • กดตีอีกครั้งเพื่อดื่ม":"ถือไอเทมอยู่")
}
function weaponScore(w){return (w.power||1)*100+({common:0,rare:12,epic:24,legendary:40}[w.rarity]||0)+(w.durability||0)}
function receiveWeapon(item){
 if(item.durability==null){const max=["greatsword","hammer","axe"].includes(item.type)?5:["staff","bow","wand","boomerang"].includes(item.type)?3:4;item.durability=max;item.maxDurability=max;item.throwable=true}
 player.weapon=item;heldObject={type:"weapon",item};Audio.pickup();showToast(`ถือ ${item.name} • กระโดด+ตีเพื่อปา`)
}
function updatePickupUI(){
 if(!nearbyPickup)return;
 if(nearbyPickup._hinted)return;nearbyPickup._hinted=true;
 const label=nearbyPickup.type==="weapon"?(nearbyPickup.item?.name||"อาวุธ"):nearbyPickup.type==="potion"?"ยา":nearbyPickup.type;
 showToast(`กด ตี เพื่อหยิบ ${label}`)
}
function pickupNearby(){classicAttack()}
function collect(d){pickupNearby()}
function dropColor(d){return d.type==="heal"?"#83ff9e":d.type==="mana"?"#80c7ff":d.type==="potion"?"#b6ff86":d.type==="ult"?"#ffe36d":RARITY[d.item?.rarity||"common"].color}

function gainXp(n){}

function stageTransition(){stageCleared=true;$("stageGate").classList.remove("hidden")}

function renderBag(){}
function renderJobs(){}

function addCombo(){comboHits++;comboExpire=2;$("comboCounter").textContent=comboHits+" HIT";$("comboCounter").classList.remove("hidden")}
function resetCombo(){comboHits=0;comboExpire=0;$("comboCounter").classList.add("hidden")}
function showToast(t){$("pickupToast").textContent=t;$("pickupToast").classList.add("toast-show");clearTimeout(showToast.t);showToast.t=setTimeout(()=>$("pickupToast").classList.remove("toast-show"),850)}
function showDamage(x,y,t,c){const r=canvas.getBoundingClientRect(),n=document.createElement("div");n.className="damage-number";n.style.left=r.left+x*(r.width/1280)+"px";n.style.top=r.top+y*(r.height/720)+"px";n.style.color=c;n.textContent=t;$("gameWrap").appendChild(n);setTimeout(()=>n.remove(),720)}
function updateHud(){
 const h=HEROES[player.hero];
 $("heroName").textContent=h.name;$("heroTag").textContent=h.tag;
 $("weaponName").textContent=heldObject?(heldObject.type==="weapon"?`ถือ ${heldObject.item?.name||"อาวุธ"}`:`ถือ ${heldObject.type}`):player.weapon.name;
 $("hpBar").style.width=100*clamp(player.hp/player.maxHp,0,1)+"%";$("mpBar").style.width=100*clamp(player.mp/player.maxMp,0,1)+"%";if($("armorBar"))$("armorBar").style.width=100*clamp((player.armor||0)/(player.maxArmor||1),0,1)+"%";
 $("ultBar").style.width=player.ult+"%";
 drawMiniMap()
}
function drawMiniMap(){
 const c=$("miniMap");if(!c||!player)return;const m=c.getContext("2d");m.clearRect(0,0,c.width,c.height);m.fillStyle="#05080d";m.fillRect(0,0,c.width,c.height);
 const sx=c.width/1280,sy=c.height/720;
 m.strokeStyle="#ffffff24";m.strokeRect(1,1,c.width-2,c.height-2);
 for(const e of enemies){if(e.dead)continue;m.fillStyle=e.boss?"#ff506d":e.elite?(ELITE_AFFIX[e.affix]?.color||"#ffb36d"):"#ff9b9b";m.fillRect(e.x*sx-2,e.y*sy-2,e.boss?6:4,e.boss?6:4)}
 for(const p of NET.peers.values()){if(p.playerId===NET.playerId)continue;m.fillStyle="#8ce7ff";m.fillRect((p.x||0)*sx-2,(p.y||0)*sy-2,4,4)}
 m.fillStyle="#7fffaa";m.fillRect(player.x*sx-3,player.y*sy-3,6,6)
}
function updateEffects(dt){for(const e of effects){e.life-=dt;if(["spark","dust","chargeSpark","poisonPuff","shard"].includes(e.type)){e.x+=(e.vx||0)*dt;e.y+=(e.vy||0)*dt;if(e.type==="dust"||e.type==="shard")e.vy=(e.vy||0)+80*dt}}effects=effects.filter(e=>e.life>0)}
function drawAtmosphere(){
 const t=performance.now()/1000;ctx.save();
 const top=ctx.createLinearGradient(0,0,0,720);top.addColorStop(0,"rgba(3,5,12,.34)");top.addColorStop(.55,"rgba(8,5,10,.04)");top.addColorStop(1,"rgba(0,0,0,.18)");ctx.fillStyle=top;ctx.fillRect(0,0,1280,720);
 const count=stageIndex===3?52:stageIndex===0?34:26;
 for(let i=0;i<count;i++){
   const seed=i*97.31,xx=(seed*13+t*(stageIndex===3?-70:stageIndex===0?18:8))%1380-50,yy=(seed*7+(stageIndex===3?t*210:t*24))%760-20;
   if(stageIndex===3){ctx.strokeStyle="rgba(155,195,225,.24)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx-5,yy+20);ctx.stroke()}
   else{ctx.fillStyle=stageIndex===0?"rgba(255,118,58,.34)":stageIndex===2?"rgba(164,105,255,.24)":"rgba(220,232,215,.12)";ctx.fillRect(xx,yy,2,stageIndex===0?4:2)}
 }
 const gg=ctx.createLinearGradient(0,460,0,720);gg.addColorStop(0,"rgba(255,255,255,0)");gg.addColorStop(1,stageIndex===3?"rgba(69,130,170,.11)":"rgba(255,150,90,.035)");ctx.fillStyle=gg;ctx.fillRect(0,430,1280,290);ctx.restore()
}

function draw(){ctx.save();if(screenShake){const tt=performance.now();ctx.translate(Math.sin(tt*.047)*screenShake*.72,Math.cos(tt*.061)*screenShake*.42)}const bg=images["s_"+stageIndex];if(bg)ctx.drawImage(bg,0,0,1280,720);else{ctx.fillStyle="#17202c";ctx.fillRect(0,0,1280,720)}drawAtmosphere();
 // cinematic color grade
 const grd=ctx.createRadialGradient(640,360,180,640,360,760);grd.addColorStop(0,"rgba(25,20,18,0)");grd.addColorStop(.72,"rgba(18,10,14,.10)");grd.addColorStop(1,"rgba(0,0,0,.46)");ctx.fillStyle=grd;ctx.fillRect(0,0,1280,720);
 if(enemies.some(e=>e.boss&&!e.dead)){ctx.fillStyle="rgba(120,18,8,.055)";ctx.fillRect(0,0,1280,720)}
 if(flash){ctx.globalAlpha=Math.min(.25,flash*3);ctx.fillStyle="#fff";ctx.fillRect(0,0,1280,720);ctx.globalAlpha=1}
 const actors=[...stageObjects.filter(o=>!o.dead).map(o=>({y:o.y,type:"object",o})),...drops.map(o=>({y:o.y,type:"drop",o})),...enemies.map(o=>({y:o.y,type:"enemy",o})),...Array.from(NET.peers.values()).filter(p=>p.playerId!==NET.playerId).map(o=>({y:o.y,type:"peer",o})),{y:player.y,type:"player",o:player}].sort((a,b)=>a.y-b.y);for(const a of actors){if(a.type==="player")drawPlayer(a.o);else if(a.type==="enemy")drawEnemy(a.o);else if(a.type==="peer")drawPeer(a.o);else if(a.type==="object")drawStageObject(a.o);else drawDrop(a.o)}drawProjectiles();drawCombatLight();drawEffects();ctx.restore()}
function spritePose(state,frameFloat,rows){
 const a=rows[state]||rows.idle,n=Math.max(1,a[1]),p=(frameFloat||0)/n,t=p*Math.PI*2;
 if(state==="idle")return{bob:Math.sin(t)*1.5,rot:Math.sin(t)*.008,sx:1+Math.sin(t)*.006,sy:1-Math.sin(t)*.006};
 if(state==="run")return{bob:Math.abs(Math.sin(t))*3.2,rot:Math.sin(t)*.025,sx:1+Math.abs(Math.sin(t))*.025,sy:1-Math.abs(Math.sin(t))*.03};
 if(state==="jump")return{bob:0,rot:-.04,sx:.98,sy:1.035};
 if(state&&state.startsWith("attack")){const q=Math.min(1,Math.max(0,p)),sw=Math.sin(q*Math.PI);return{bob:-sw*2.4,rot:(q-.5)*.10,sx:1+sw*.045,sy:1-sw*.035}}
 if(state==="skill"||state==="ultimate"){const sw=Math.sin(Math.min(1,p)*Math.PI);return{bob:-sw*3,rot:0,sx:1+sw*.055,sy:1-sw*.035}}
 if(state==="hit")return{bob:1,rot:.055,sx:1.06,sy:.94};
 if(state==="death")return{bob:0,rot:Math.min(.18,p*.20),sx:1.03,sy:.97};
 return{bob:0,rot:0,sx:1,sy:1}
}
function sprite(img,rows,state,frame,x,y,face,scale,fs){
 if(!img)return;
 const a=rows[state]||rows.idle,n=a[1],loop=["idle","run","jump","block"].includes(state);
 const ff=Number.isFinite(frame)?frame:0,i0=Math.floor(ff),frac=ff-i0,i1=loop?(i0+1)%n:Math.min(n-1,i0+1),sy=a[0]*fs,pose=spritePose(state,ff,rows);
 ctx.save();ctx.translate(x,y+pose.bob);ctx.rotate(pose.rot*(face<0?-1:1));ctx.scale((face<0?-1:1)*scale*pose.sx,scale*pose.sy);
 ctx.shadowColor="rgba(0,0,0,.72)";ctx.shadowBlur=4;ctx.shadowOffsetY=2;
 const df=(idx,alpha)=>{ctx.globalAlpha=alpha;ctx.drawImage(img,idx*fs,sy,fs,fs,-fs/2,-fs+.1*fs,fs,fs)};
 df(i0,1-frac*.55);if(frac>.03)df(i1,frac*.55);ctx.restore()
}
function shadow(x,y,w){ctx.save();ctx.globalAlpha=.32;ctx.fillStyle="#05060a";ctx.filter="blur(2px)";ctx.beginPath();ctx.ellipse(x,y+8,w,9,0,0,Math.PI*2);ctx.fill();ctx.restore()}
function drawWeaponOverlay(p,type){
 const im=images["w_"+type];if(!im)return;
 const attacking=p.state&&p.state.startsWith("attack"),skill=p.state==="skill"||p.state==="ultimate",guarding=p.state==="block"||(!p.playerId&&blocking),heavy=["greatsword","hammer","axe","halberd"].includes(type);
 const glow=ELEMENTS[p.weapon?.element||"none"]?.color||HEROES[p.hero]?.color||"#fff";let phase=0;
 if(attacking){const a=HROWS[p.state]||HROWS.attack1;phase=clamp((p.stateTime||0)/(a[1]/a[2]),0,1)}
 else if(skill){const a=HROWS[p.state]||HROWS.skill;phase=clamp((p.stateTime||0)/(a[1]/a[2]),0,1)}
 const q=phase<.5?2*phase*phase:1-Math.pow(-2*phase+2,2)/2;let ang=0,dx=30,dy=-57;
 const style=p.attackStyle||(p.attackStep===2?"rising":p.attackStep>=3?"overhead":"horizontal");
 if(guarding){ang=-1.18;dx=17;dy=-64}
 else if(attacking){
   if(style==="horizontal")ang=-1.15+2.05*q;
   else if(style==="rising")ang=.92-2.20*q;
   else if(style==="overhead")ang=-2.05+3.35*q;
   else ang=1.45-2.75*q
 }else if(skill)ang=-1.25+2.45*q;
 const size=heavy?[92,46]:["spear","halberd"].includes(type)?[108,42]:["bow","staff","wand"].includes(type)?[84,40]:[82,40];
 ctx.save();ctx.translate(p.x+p.facing*dx,p.y-(p.z||0)+dy);ctx.scale(p.facing,1);ctx.rotate(ang);
 if((attacking||skill)&&!guarding){for(let i=5;i>=1;i--){ctx.save();ctx.globalAlpha=.045*(6-i);ctx.rotate(-.038*i);ctx.drawImage(im,-size[0]*.42-i*3,-size[1]/2,size[0],size[1]);ctx.restore()}}
 ctx.globalAlpha=.99;ctx.shadowBlur=(attacking||skill)?24:guarding?14:9;ctx.shadowColor=glow;ctx.drawImage(im,-size[0]*.42,-size[1]/2,size[0],size[1]);
 ctx.globalAlpha=.7;ctx.fillStyle="#fff";ctx.fillRect(size[0]*.17,-size[1]*.20,heavy?15:10,2);ctx.restore()
}

function mixHex(a,b,t){
 const pa=parseInt(a.replace("#","").slice(0,6),16),pb=parseInt(b.replace("#","").slice(0,6),16);
 const ar=(pa>>16)&255,ag=(pa>>8)&255,ab=pa&255,br=(pb>>16)&255,bg=(pb>>8)&255,bb=pb&255;
 const r=Math.round(ar+(br-ar)*t),gg=Math.round(ag+(bg-ag)*t),bl=Math.round(ab+(bb-ab)*t);
 return `rgb(${r},${gg},${bl})`
}
function limb(x1,y1,x2,y2,w,c,edge="#0a0b10"){
 ctx.lineCap="round";ctx.strokeStyle=edge;ctx.lineWidth=w+5;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
 ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()
}
function plate(cx,cy,w,h,c,edge="#090b10"){
 const gr=ctx.createLinearGradient(cx-w/2,cy-h/2,cx+w/2,cy+h/2);gr.addColorStop(0,mixHex(c,"#ffffff",.28));gr.addColorStop(.42,c);gr.addColorStop(1,mixHex(c,"#000000",.45));
 ctx.fillStyle=edge;ctx.beginPath();ctx.roundRect(cx-w/2-3,cy-h/2-3,w+6,h+6,6);ctx.fill();
 ctx.fillStyle=gr;ctx.beginPath();ctx.roundRect(cx-w/2,cy-h/2,w,h,5);ctx.fill()
}
function drawCape(wave,accent){
 ctx.save();ctx.globalAlpha=.9;ctx.fillStyle=mixHex(accent,"#3d0712",.58);ctx.strokeStyle="#16070b";ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(-13,-70);ctx.bezierCurveTo(-38,-58,-42+wave*8,-25,-30+wave*11,-2);ctx.lineTo(-8,-12);ctx.lineTo(2,-65);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()
}
function actorMotion(o){
 const st=o.state||"idle",t=o.stateTime||0;
 let run=Math.sin(t*13),bob=0,lean=0,armF=0,armB=0,legF=0,legB=0,squash=1;
 if(st==="idle"){bob=Math.sin(t*4)*1.2;armF=.08+Math.sin(t*4)*.03;armB=-.08-Math.sin(t*4)*.03}
 else if(st==="run"){bob=Math.abs(run)*3;lean=.08*(o.facing||1);legF=run*.68;legB=-run*.68;armF=-run*.48;armB=run*.48}
 else if(st==="jump"){bob=-2;lean=-.05;legF=.55;legB=-.35;armF=-.5;armB=.35}
 else if(st&&st.startsWith("attack")){
   const a=HROWS[st]||HROWS.attack1,q=clamp(t/(a[1]/a[2]),0,1),sw=Math.sin(q*Math.PI);
   lean=.14*sw;armF=-1.35+q*2.35;armB=.25-.35*sw;legF=.20*sw;legB=-.15*sw;squash=1-.035*sw
 }else if(st==="skill"||st==="ultimate"){
   const a=HROWS[st]||HROWS.skill,q=clamp(t/(a[1]/a[2]),0,1),sw=Math.sin(q*Math.PI);
   bob=-4*sw;armF=-1.4+2.8*q;armB=1.1-2.2*q;lean=.10*sw;squash=1-.04*sw
 }else if(st==="hit"){lean=-.16;squash=.92}
 else if(st==="death"){lean=.55;squash=.9}
 else if(st==="block"){bob=1.5;lean=-.12;armF=-1.34;armB=-.42;legF=.44;legB=-.50;squash=.94}
 return{bob,lean,armF,armB,legF,legB,squash,run}
}
function drawCinematicHero(p,remote=false){
 const h=HEROES[p.hero]||HEROES.ronin,base=h.color||"#bfc9d8",accent=mixHex(base,"#ff9b55",.20),dark=mixHex(base,"#06070a",.58);
 const m=actorMotion(p),face=p.facing||1,x=p.x,y=p.y-(p.z||0);
 ctx.save();ctx.translate(x,y+m.bob);ctx.scale(face,1);ctx.rotate(m.lean*face);ctx.scale(1,m.squash);

 // contact glow
 const aura=ctx.createRadialGradient(0,-45,6,0,-45,54);aura.addColorStop(0,`rgba(255,255,255,${remote?.035:.06})`);aura.addColorStop(1,"rgba(255,255,255,0)");
 ctx.fillStyle=aura;ctx.fillRect(-60,-105,120,125);

 drawCape(Math.sin((p.stateTime||0)*7),accent);

 // back leg
 const hipY=-31,legLen=30;
 let ax=Math.sin(m.legB)*16,ay=hipY+Math.cos(m.legB)*legLen;
 limb(-7,hipY,-7+ax,ay,10,mixHex(dark,"#ffffff",.12));
 plate(-7+ax,ay+4,15,11,"#232731");
 // front leg
 ax=Math.sin(m.legF)*16;ay=hipY+Math.cos(m.legF)*legLen;
 limb(7,hipY,7+ax,ay,11,mixHex(base,"#111827",.52));
 plate(7+ax,ay+4,16,12,"#2c313d");

 // torso armor
 plate(0,-57,40,46,base);
 ctx.fillStyle=mixHex(base,"#ffffff",.35);ctx.fillRect(-3,-76,6,33);
 ctx.fillStyle=accent;ctx.beginPath();ctx.moveTo(-17,-61);ctx.lineTo(0,-48);ctx.lineTo(17,-61);ctx.lineTo(0,-41);ctx.closePath();ctx.globalAlpha=.42;ctx.fill();ctx.globalAlpha=1;

 // shoulders
 plate(-23,-69,18,16,mixHex(base,"#ffffff",.12));plate(23,-69,18,16,mixHex(base,"#ffffff",.18));

 // back arm
 let shx=-18,shy=-67,ex=shx+Math.cos(m.armB)*24,ey=shy+Math.sin(m.armB)*24,wx=ex+Math.cos(m.armB-.15)*24,wy=ey+Math.sin(m.armB-.15)*24;
 limb(shx,shy,ex,ey,8,mixHex(dark,"#ffffff",.16));limb(ex,ey,wx,wy,7,mixHex(dark,"#ffffff",.22));
 // front arm
 shx=18;shy=-67;ex=shx+Math.cos(m.armF)*25;ey=shy+Math.sin(m.armF)*25;wx=ex+Math.cos(m.armF-.1)*25;wy=ey+Math.sin(m.armF-.1)*25;
 limb(shx,shy,ex,ey,9,mixHex(base,"#111827",.40));limb(ex,ey,wx,wy,8,mixHex(base,"#111827",.32));

 // neck/head
 ctx.fillStyle="#d8a172";ctx.strokeStyle="#151116";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-94,17,0,Math.PI*2);ctx.fill();ctx.stroke();
 // hair silhouette
 ctx.fillStyle=mixHex(h.color||"#8a6b5a","#09090d",.62);ctx.beginPath();
 ctx.moveTo(-17,-98);ctx.quadraticCurveTo(-9,-119,2,-110);ctx.quadraticCurveTo(12,-120,18,-99);ctx.lineTo(12,-105);ctx.lineTo(7,-96);ctx.lineTo(0,-108);ctx.lineTo(-6,-96);ctx.lineTo(-12,-104);ctx.closePath();ctx.fill();
 // eyes
 ctx.fillStyle="#fff";ctx.fillRect(4,-96,5,2);ctx.fillStyle=accent;ctx.fillRect(7,-96,2,2);

 // scarf / collar
 ctx.fillStyle=mixHex(accent,"#5d0710",.42);ctx.beginPath();ctx.moveTo(-15,-82);ctx.lineTo(13,-82);ctx.lineTo(18,-72);ctx.lineTo(-13,-73);ctx.closePath();ctx.fill();

 // hero-specific detail
 if(p.hero==="arcane"||p.hero==="faye"){ctx.strokeStyle="#7dc8ff";ctx.shadowBlur=10;ctx.shadowColor="#7dc8ff";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-93,24,Math.PI,Math.PI*2);ctx.stroke()}
 if(p.hero==="grom"||p.hero==="bronn"){plate(0,-56,46,50,mixHex(base,"#7a1d16",.22))}
 if(p.hero==="nami"||p.hero==="lyra"){ctx.fillStyle="#dce8ff";ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(-17,-74);ctx.lineTo(-28,-52);ctx.lineTo(-10,-58);ctx.fill();ctx.globalAlpha=1}

 // v2.3 armor micro-details
 ctx.fillStyle="#171318";ctx.fillRect(-20,-43,40,7);ctx.fillStyle="#c5944f";ctx.fillRect(-4,-44,8,8);
 ctx.strokeStyle=mixHex(base,"#ffffff",.32);ctx.globalAlpha=.62;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-17,-67);ctx.lineTo(17,-67);ctx.moveTo(-15,-57);ctx.lineTo(15,-57);ctx.moveTo(-12,-50);ctx.lineTo(12,-50);ctx.stroke();ctx.globalAlpha=1;
 for(const xx of [-23,23]){ctx.fillStyle="#2b2d34";ctx.fillRect(xx-6,-62,12,10);ctx.fillStyle="#aeb5c1";ctx.fillRect(xx-4,-61,8,2)}
 ctx.fillStyle="#4b3130";ctx.beginPath();ctx.moveTo(-18,-41);ctx.lineTo(-6,-15);ctx.lineTo(-1,-40);ctx.closePath();ctx.fill();

 ctx.restore()
}
function enemyPalette(e){
 const map={grunt:"#6d767f",rogue:"#4b4657",brute:"#7f4b3c",mage:"#5a4278",warlock:"#50326f",archer:"#556449",shield:"#6f7782",warden:"#6b5062",beast:"#5b493c",crawler:"#56513c",spearman:"#657067"};
 return map[e.type]||"#68707b"
}
function drawCinematicEnemy(e){
 const m=actorMotion(e),face=e.facing||1,x=e.x,y=e.y-(e.z||0),base=e.boss?"#252733":enemyPalette(e),accent=e.boss?"#a61919":(e.elite?(ELITE_AFFIX[e.affix]?.color||"#ba8cff"):"#9a542f");
 const scale=e.boss?1.55:e.type==="brute"?1.17:1;
 ctx.save();ctx.translate(x,y+m.bob);ctx.scale(face*scale,scale);ctx.rotate(m.lean*face);ctx.scale(1,m.squash);
 if(e.boss){
   ctx.fillStyle="#3b0710";ctx.beginPath();ctx.moveTo(-18,-80);ctx.bezierCurveTo(-55,-63,-56,-14,-34,5);ctx.lineTo(-8,-11);ctx.lineTo(0,-76);ctx.closePath();ctx.fill()
 }
 // legs
 let hip=-31,a=Math.sin(m.legB)*15,yy=hip+Math.cos(m.legB)*29;limb(-7,hip,-7+a,yy,10,mixHex(base,"#000000",.16));plate(-7+a,yy+4,15,11,"#1e2128");
 a=Math.sin(m.legF)*15;yy=hip+Math.cos(m.legF)*29;limb(7,hip,7+a,yy,11,mixHex(base,"#ffffff",.06));plate(7+a,yy+4,16,12,"#262b33");

 // torso / armor
 plate(0,-58,e.boss?48:40,e.boss?52:45,base);
 if(e.boss){plate(-29,-70,22,19,"#30333d");plate(29,-70,22,19,"#30333d")}
 else{plate(-22,-69,17,15,mixHex(base,"#ffffff",.10));plate(22,-69,17,15,mixHex(base,"#ffffff",.10))}

 // arms
 let sh=-18,ex=sh+Math.cos(m.armB)*24,ey=-67+Math.sin(m.armB)*24,wx=ex+Math.cos(m.armB-.1)*23,wy=ey+Math.sin(m.armB-.1)*23;
 limb(sh,-67,ex,ey,8,mixHex(base,"#000000",.14));limb(ex,ey,wx,wy,7,mixHex(base,"#000000",.08));
 sh=18;ex=sh+Math.cos(m.armF)*25;ey=-67+Math.sin(m.armF)*25;wx=ex+Math.cos(m.armF-.1)*24;wy=ey+Math.sin(m.armF-.1)*24;
 limb(sh,-67,ex,ey,9,mixHex(base,"#ffffff",.02));limb(ex,ey,wx,wy,8,mixHex(base,"#ffffff",.05));

 // head / helmet
 ctx.fillStyle=e.boss?"#15171d":"#b07b59";ctx.strokeStyle="#101116";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-94,e.boss?18:16,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle=mixHex(base,"#050607",.44);ctx.beginPath();ctx.moveTo(-18,-101);ctx.lineTo(-12,-115);ctx.lineTo(-5,-105);ctx.lineTo(0,-119);ctx.lineTo(5,-105);ctx.lineTo(12,-115);ctx.lineTo(18,-101);ctx.lineTo(12,-87);ctx.lineTo(-12,-87);ctx.closePath();ctx.fill();
 // glowing eyes
 ctx.shadowBlur=e.boss?16:8;ctx.shadowColor=accent;ctx.fillStyle=e.boss?"#ff2f24":accent;ctx.fillRect(-10,-96,5,3);ctx.fillRect(5,-96,5,3);ctx.shadowBlur=0;

 if(e.ai==="shield"){ctx.fillStyle="#5c6672";ctx.strokeStyle="#c8d3df";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(23,-70);ctx.lineTo(45,-62);ctx.lineTo(43,-25);ctx.lineTo(23,-17);ctx.closePath();ctx.fill();ctx.stroke()}
 if(e.ai==="mage"||e.ai==="archer"){ctx.fillStyle=mixHex(base,"#12091e",.35);ctx.globalAlpha=.42;ctx.beginPath();ctx.moveTo(-19,-76);ctx.lineTo(19,-76);ctx.lineTo(28,-6);ctx.lineTo(-28,-6);ctx.closePath();ctx.fill();ctx.globalAlpha=1}
 if(e.boss){
   ctx.fillStyle="#61121e";ctx.beginPath();ctx.moveTo(-26,-83);ctx.lineTo(26,-83);ctx.lineTo(16,-70);ctx.lineTo(-18,-70);ctx.closePath();ctx.fill();
   // crown
   ctx.fillStyle="#353741";ctx.strokeStyle="#a16b3e";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-18,-109);ctx.lineTo(-11,-126);ctx.lineTo(-4,-112);ctx.lineTo(0,-132);ctx.lineTo(6,-112);ctx.lineTo(14,-126);ctx.lineTo(19,-108);ctx.closePath();ctx.fill();ctx.stroke()
 }
 ctx.restore()
}

function drawRagdoll(e){
 const r=e.ragdoll||{rot:0,spread:1},base=e.boss?"#32343e":enemyPalette(e),sc=e.boss?1.45:e.type==="brute"?1.12:1;
 ctx.save();ctx.translate(e.x,e.y-e.z-48);ctx.rotate(r.rot);ctx.scale(sc,sc);
 plate(0,0,40,46,base);ctx.fillStyle="#a97758";ctx.strokeStyle="#111319";ctx.lineWidth=3;ctx.beginPath();ctx.arc(22,-28,16,0,Math.PI*2);ctx.fill();ctx.stroke();
 limb(-12,-8,-38,-12-r.spread*10,10,mixHex(base,"#000000",.1));limb(12,-8,38,3+r.spread*12,10,mixHex(base,"#ffffff",.05));
 limb(-9,18,-29,46+r.spread*8,11,mixHex(base,"#000000",.14));limb(9,18,34,39-r.spread*5,11,mixHex(base,"#ffffff",.03));
 ctx.restore()
}
function drawHeldObject(p){
 if(p!==player||!heldObject||heldObject.type==="weapon")return;
 const face=p.facing||1,x=p.x-face*21,y=p.y-(p.z||0)-61;
 ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.rotate(-.28);
 const key=heldObject.type==="mana"?"item_mp":heldObject.type==="ult"?"item_ult":"item_hp",im=images[key];
 ctx.shadowBlur=12;ctx.shadowColor=heldObject.type==="mana"?"#79cfff":heldObject.type==="ult"?"#ffe275":"#7dff93";
 if(im)ctx.drawImage(im,-16,-16,32,32);else{ctx.fillStyle="#ddd";ctx.fillRect(-8,-12,16,22)}ctx.restore()
}
function drawStatusAura(e){
 if(!e.status||e.dead)return;
 const x=e.x,y=e.y-e.z-45,t=performance.now()/1000;ctx.save();
 if(e.status.burn>0){ctx.globalCompositeOperation="screen";for(let i=0;i<5;i++){const xx=x-22+i*11+Math.sin(t*8+i)*5,hh=16+8*Math.sin(t*10+i);ctx.fillStyle=i%2?"#ffca55":"#ff5c34";ctx.beginPath();ctx.moveTo(xx,y+34);ctx.quadraticCurveTo(xx-8,y+14-hh,xx,y+2-hh);ctx.quadraticCurveTo(xx+9,y+16-hh,xx+4,y+34);ctx.fill()}}
 if(e.status.freeze>0||e.status.frost>0){ctx.strokeStyle="#a8ebff";ctx.fillStyle="rgba(145,220,255,.20)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-30,y+28);ctx.lineTo(x-19,y-12);ctx.lineTo(x-7,y+2);ctx.lineTo(x+2,y-30);ctx.lineTo(x+14,y+4);ctx.lineTo(x+29,y-14);ctx.lineTo(x+35,y+28);ctx.closePath();ctx.fill();ctx.stroke()}
 if(e.status.poison>0){ctx.globalAlpha=.34;ctx.fillStyle="#70e96a";for(let i=0;i<5;i++){const xx=x+Math.sin(t*1.8+i*2)*29,yy=y+Math.cos(t*1.4+i)*20;ctx.beginPath();ctx.arc(xx,yy,7+i%3,0,Math.PI*2);ctx.fill()}}
 ctx.restore()
}

function drawPlayer(p){
 shadow(p.x,p.y,34);
 drawCinematicHero(p,false);
 drawWeaponOverlay(p,p.weapon.type);drawHeldObject(p);
 if(p.drinking){ctx.save();ctx.translate(p.x+p.facing*11,p.y-p.z-55);ctx.fillStyle="#8cff98";ctx.fillRect(-5,-9,10,16);ctx.fillStyle="#fff";ctx.fillRect(-3,-13,6,5);ctx.restore()}
 if(blocking||p.weapon.type==="shieldblade"){ctx.save();ctx.translate(p.x+p.facing*27,p.y-p.z-42);ctx.scale(p.facing,1);ctx.rotate(-.08);ctx.fillStyle=blocking?"rgba(195,221,235,.26)":"rgba(158,171,176,.16)";ctx.strokeStyle=blocking?"#f3fbff":"#a8b5bd";ctx.lineWidth=blocking?3:2;ctx.shadowBlur=blocking?18:7;ctx.shadowColor="#cdeaff";ctx.beginPath();ctx.moveTo(-3,-30);ctx.lineTo(24,-19);ctx.lineTo(21,23);ctx.lineTo(-2,31);ctx.lineTo(-13,8);ctx.lineTo(-12,-13);ctx.closePath();ctx.fill();ctx.stroke();if(blocking){ctx.globalAlpha=.55;ctx.beginPath();ctx.moveTo(-9,-12);ctx.lineTo(18,18);ctx.moveTo(-3,23);ctx.lineTo(18,-17);ctx.stroke()}ctx.restore()}
}
function drawPeer(p){
 if(!p||!p.hero)return;shadow(p.x,p.y,32);drawCinematicHero(p,true);drawWeaponOverlay(p,p.weaponType||"katana");
 ctx.save();ctx.textAlign="center";ctx.font="700 10px Arial";ctx.fillStyle="#8ce7ff";ctx.fillText((HEROES[p.hero]||HEROES.ronin).name,p.x,p.y-(p.z||0)-112);ctx.restore()
}
function drawEnemy(e){
 const fade=e.dead?clamp(1-(e.deathTime||0)/.92,0,1):1;ctx.save();ctx.globalAlpha=fade;shadow(e.x,e.y,e.boss?58:31);
 if(e.elite&&!e.dead){ctx.save();ctx.globalAlpha=.24;ctx.strokeStyle=ELITE_AFFIX[e.affix]?.color||"#fff";ctx.lineWidth=4;ctx.shadowBlur=14;ctx.shadowColor=ctx.strokeStyle;ctx.beginPath();ctx.arc(e.x,e.y-e.z-42,38+Math.sin(performance.now()/120)*2,0,Math.PI*2);ctx.stroke();ctx.restore()}
 if(e.dead&&e.ragdoll)drawRagdoll(e);else drawCinematicEnemy(e);drawStatusAura(e);
 if(!e.dead){
   const w=e.boss?140:58;ctx.fillStyle="#000b";ctx.fillRect(e.x-w/2,e.y-e.z-(e.boss?132:108),w,8);
   const hp=clamp(e.hp/e.maxHp,0,1),gr=ctx.createLinearGradient(e.x-w/2,0,e.x+w/2,0);gr.addColorStop(0,e.boss?"#8e1016":"#d9e0e7");gr.addColorStop(1,e.boss?"#ff633d":"#ffffff");ctx.fillStyle=gr;ctx.fillRect(e.x-w/2,e.y-e.z-(e.boss?132:108),w*hp,8);
   if(e.maxArmor>0&&e.armor>0){ctx.fillStyle="rgba(8,15,22,.86)";ctx.fillRect(e.x-w/2,e.y-e.z-(e.boss?143:119),w,5);ctx.fillStyle="#a8cbe6";ctx.fillRect(e.x-w/2,e.y-e.z-(e.boss?143:119),w*clamp(e.armor/e.maxArmor,0,1),5)}
   if(e.elite){ctx.save();ctx.textAlign="center";ctx.font="800 9px Arial";ctx.fillStyle=ELITE_AFFIX[e.affix]?.color||"#fff";ctx.fillText(ELITE_AFFIX[e.affix]?.name||"ELITE",e.x,e.y-e.z-118);ctx.restore()}
   if((e.state==="attack"||e.state==="skill")&&e.stateTime<.48){
     const p=clamp(e.stateTime/.48,0,1),r=e.boss?92:e.pattern==="ranged"?74:56;ctx.save();ctx.translate(e.x,e.y-e.z-34);ctx.scale(e.facing,1);
     ctx.globalAlpha=.11+.33*p;ctx.fillStyle=e.boss?"#ff4d35":"#ffb866";ctx.strokeStyle="#fff3cf";ctx.lineWidth=2;
     if(e.pattern==="ranged"){ctx.fillRect(20,-5,160*p+25,10);ctx.strokeRect(20,-5,160*p+25,10)}
     else{ctx.beginPath();ctx.moveTo(8,0);ctx.arc(8,0,r,-.72,.72);ctx.closePath();ctx.fill();ctx.stroke()}ctx.restore()
   }
 }
 ctx.restore()
}
function pxRect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function drawStageObject(o){
 const x=Math.round(o.x),y=Math.round(o.y),flash=o.flash>0;
 shadow(x,y,o.type==="minecart"?32:24);
 ctx.save();ctx.translate(x,y);if(flash){ctx.globalAlpha=.62;o.flash=Math.max(0,o.flash-.025)}
 const wood="#a96f3e",wood2="#7d482a",metal="#6c7682",stone="#85858e",stone2="#565c68",leaf="#4f9653",leaf2="#28633a",gold="#e7b94f";
 if(o.type==="barrel"){
  pxRect(-20,-48,40,43,wood2);pxRect(-17,-46,34,39,wood);pxRect(-19,-38,38,5,metal);pxRect(-19,-18,38,5,metal);pxRect(-7,-45,4,36,"#c98b4c");pxRect(7,-45,3,36,wood2)
 }else if(o.type==="crate"){
  pxRect(-23,-45,46,40,wood2);pxRect(-20,-42,40,34,wood);pxRect(-20,-40,6,30,"#d39958");pxRect(14,-40,5,30,wood2);ctx.strokeStyle="#694022";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-17,-38);ctx.lineTo(17,-10);ctx.moveTo(17,-38);ctx.lineTo(-17,-10);ctx.stroke()
 }else if(o.type==="chest"){
  pxRect(-27,-31,54,27,wood2);pxRect(-24,-29,48,22,wood);pxRect(-26,-47,52,18,wood2);ctx.fillStyle=wood;ctx.beginPath();ctx.arc(0,-29,24,Math.PI,0);ctx.fill();pxRect(-4,-27,8,12,gold);pxRect(-28,-27,5,18,metal);pxRect(23,-27,5,18,metal)
 }else if(o.type==="vase"){
  pxRect(-12,-38,24,7,"#8c6f7e");pxRect(-17,-31,34,22,"#a98392");pxRect(-12,-9,24,5,"#6c5163");pxRect(-5,-27,4,15,"#d0a7b3")
 }else if(o.type==="bush"){
  for(const [dx,dy,s] of [[-18,-18,17],[0,-25,20],[19,-17,16],[-3,-10,24]]){ctx.fillStyle=leaf2;ctx.beginPath();ctx.arc(dx,dy,s,0,Math.PI*2);ctx.fill();ctx.fillStyle=leaf;ctx.beginPath();ctx.arc(dx-3,dy-4,s-4,0,Math.PI*2);ctx.fill()}
  pxRect(-3,-11,6,10,"#6b4728")
 }else if(o.type==="minecart"){
  pxRect(-30,-37,60,27,metal);pxRect(-25,-34,50,21,wood2);pxRect(-21,-31,42,15,wood);for(const dx of [-20,19]){ctx.fillStyle="#333943";ctx.beginPath();ctx.arc(dx,-4,9,0,Math.PI*2);ctx.fill();ctx.fillStyle=metal;ctx.beginPath();ctx.arc(dx,-4,4,0,Math.PI*2);ctx.fill()}
 }else{
  const h=o.type==="column"?58:o.type==="stone_pillar"?52:48;
  pxRect(-15,-h,30,h-5,stone2);pxRect(-11,-h+3,22,h-10,stone);pxRect(-19,-h,38,8,stone2);pxRect(-19,-13,38,8,stone2);pxRect(-6,-h+10,4,h-25,"#a2a1aa")
 }
 ctx.restore();
 const h=o.type==="bush"?48:o.type==="minecart"?44:o.type==="column"?62:54;
 if(o.hp<o.maxHp){ctx.fillStyle="#05070daa";ctx.fillRect(x-22,y-h-5,44,4);ctx.fillStyle="#ffd36d";ctx.fillRect(x-22,y-h-5,44*clamp(o.hp/o.maxHp,0,1),4)}
}
function drawPotionIcon(x,y,type,color,scale=1){
 const key=type==="mana"?"item_mp":type==="ult"?"item_ult":"item_hp",im=images[key];
 if(im){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.drawImage(im,-24,-24,48,48);ctx.restore();return}
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle=color;ctx.fillRect(-8,-9,16,17);ctx.restore()
}
function drawDrop(d){
 shadow(d.x,d.y,19);const y=d.y-d.z-18+Math.sin(d.bob)*3,c=dropColor(d);
 ctx.save();ctx.globalAlpha=.18+.08*Math.sin(d.bob*2);ctx.fillStyle=c;ctx.fillRect(d.x-2,y-54,4,54);ctx.restore();
 if(d.type==="weapon"){
  const im=images["w_"+d.item.type];ctx.save();ctx.shadowBlur=d.item.rarity==="legendary"?20:10;ctx.shadowColor=c;
  if(im)ctx.drawImage(im,d.x-43,y-23,86,43);ctx.restore();
  ctx.font="800 10px Tahoma";ctx.textAlign="center";ctx.fillStyle=c;ctx.fillText(d.item.name,d.x,y-30);
  ctx.font="8px Tahoma";ctx.fillText(`${d.item.rarity.toUpperCase()} • ${ELEMENTS[d.item.element||"none"].name}`,d.x,y-18)
 }else if(d.type==="potion"||d.type==="heal")drawPotionIcon(d.x,y-5,d.type,c,1);
 else if(d.type==="mana")drawPotionIcon(d.x,y-5,d.type,"#7cc9ff",1);
 else if(d.type==="ult")drawPotionIcon(d.x,y-5,d.type,"#ffe36d",1);
 else{ctx.save();ctx.translate(d.x,y);ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(12,0);ctx.lineTo(0,14);ctx.lineTo(-12,0);ctx.closePath();ctx.fill();ctx.restore()}
}
function drawProjectiles(){
 for(const p of projectiles){ctx.save();
  if(p.thrownWeapon&&images["w_"+p.thrownWeapon.type]){
   ctx.translate(p.x,p.y);ctx.rotate((performance.now()/90)*(p.vx>0?1:-1));ctx.shadowBlur=12;ctx.shadowColor=p.color;ctx.drawImage(images["w_"+p.thrownWeapon.type],-36,-18,72,36)
  }else{
   const t=p.weaponType||"magic",dir=p.vx>=0?1:-1;ctx.translate(p.x,p.y);ctx.scale(dir,1);ctx.shadowBlur=16;ctx.shadowColor=p.color;ctx.fillStyle=p.color;
   if(t==="bow"||t==="halberd"){ctx.fillRect(-14,-2,28,4);ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(7,-6);ctx.lineTo(7,6);ctx.fill()}
   else if(t==="chakram"||t==="boomerang"){ctx.strokeStyle=p.color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,11,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#fff";ctx.fillRect(7,-2,5,4)}
   else if(t==="wand"||t==="staff"){ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(-5,-8);ctx.lineTo(-14,0);ctx.lineTo(-5,8);ctx.closePath();ctx.fill();ctx.fillStyle="#fff";ctx.fillRect(3,-2,8,4)}
   else{ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill()}
  }ctx.restore()
 }
}
function drawCombatLight(){
 if(!player)return;
 const t=performance.now()/1000,col=ELEMENTS[player.weapon?.element||"none"]?.color||HEROES[player.hero]?.color||"#fff";
 ctx.save();ctx.globalCompositeOperation="screen";ctx.globalAlpha=.045+(player.state&&player.state.startsWith("attack")?.06:0);
 const r=ctx.createRadialGradient(player.x,player.y-player.z-48,8,player.x,player.y-player.z-48,95);r.addColorStop(0,col);r.addColorStop(1,"rgba(0,0,0,0)");
 ctx.fillStyle=r;ctx.fillRect(player.x-100,player.y-player.z-145,200,190);ctx.restore()
}

function drawEffects(){
 for(const e of effects){ctx.save();const a=Math.max(0,e.life*4);ctx.globalAlpha=Math.min(1,a);
  if(e.type==="slash"){
   const r=e.heavy?88:60,st=e.style||"horizontal",base=st==="rising"?.65:st==="overhead"?-2.18:st==="reverse"?1.25:-1.18,span=st==="overhead"?2.5:st==="rising"?-2.15:st==="reverse"?-2.25:2.25;
   ctx.shadowBlur=e.heavy?30:20;ctx.shadowColor=e.color;
   for(let i=0;i<5;i++){ctx.globalAlpha=Math.min(1,a)*(1-i*.17);ctx.strokeStyle=i===0?"#fff":i===1?"#ffd8a6":e.color;ctx.lineWidth=(e.heavy?14:9)-i*1.7;ctx.beginPath();ctx.arc(e.x,e.y,r+i*6,e.dir>0?base:Math.PI-base,e.dir>0?base+span:Math.PI-(base+span),span<0);ctx.stroke()}
  }else if(e.type==="firePillar"){
   ctx.translate(e.x,e.y);ctx.globalCompositeOperation="screen";for(let i=0;i<6;i++){const xx=(i-2.5)*9,hh=(e.size||70)*(1+i*.06);ctx.fillStyle=i%2?"#ffb13b":"#ff4f27";ctx.beginPath();ctx.moveTo(xx-11,18);ctx.quadraticCurveTo(xx-24,-hh*.45,xx,-hh);ctx.quadraticCurveTo(xx+22,-hh*.35,xx+12,18);ctx.closePath();ctx.fill()}
  }else if(e.type==="iceSpike"){
   ctx.translate(e.x,e.y);ctx.fillStyle="rgba(150,226,255,.62)";ctx.strokeStyle="#e9fbff";ctx.lineWidth=2;for(let i=-2;i<=2;i++){const x=i*12,h=(e.size||70)*(1-Math.abs(i)*.1);ctx.beginPath();ctx.moveTo(x-9,15);ctx.lineTo(x,-h);ctx.lineTo(x+10,15);ctx.closePath();ctx.fill();ctx.stroke()}
  }else if(e.type==="poisonCloud"){
   ctx.translate(e.x,e.y);ctx.globalAlpha*=.35;ctx.fillStyle=e.color;for(let i=0;i<12;i++){const an=i*2.4+(1-e.life)*4,rr=(e.radius||160)*(.22+(i%5)/7);ctx.beginPath();ctx.arc(Math.cos(an)*rr*.55,Math.sin(an)*rr*.28,22+(i%4)*7,0,Math.PI*2);ctx.fill()}
  }else if(e.type==="lightningBolt"){
   ctx.translate(e.x,e.y);ctx.strokeStyle=e.color;ctx.lineWidth=4;ctx.shadowBlur=20;ctx.shadowColor="#8fdcff";ctx.beginPath();ctx.moveTo(0,-120);for(let i=1;i<=7;i++)ctx.lineTo((Math.random()-.5)*25,-120+i*18);ctx.stroke()
  }else if(e.type==="voidRift"){
   ctx.translate(e.x,e.y);ctx.strokeStyle=e.color;ctx.shadowBlur=24;ctx.shadowColor=e.color;for(let i=0;i<4;i++){ctx.globalAlpha*=.8;ctx.lineWidth=5-i;ctx.beginPath();ctx.ellipse(0,0,(e.radius||150)*(1-i*.16),30+i*7,(1-e.life)*2.4,0,Math.PI*2);ctx.stroke()}
  }else if(e.type==="chargeBurst"){
   ctx.strokeStyle=e.color;ctx.shadowBlur=22;ctx.shadowColor=e.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(e.x,e.y,(e.radius||80)*(1.2-e.life),0,Math.PI*2);ctx.stroke()
  }else if(e.type==="impact"){
   ctx.translate(e.x,e.y);ctx.strokeStyle=e.color;ctx.shadowBlur=18;ctx.shadowColor=e.color;ctx.lineWidth=3;
   for(let i=0;i<8;i++){const ang=i*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(ang)*4,Math.sin(ang)*4);ctx.lineTo(Math.cos(ang)*e.size,Math.sin(ang)*e.size);ctx.stroke()}
   ctx.fillStyle="#fff";ctx.rotate(Math.PI/4);ctx.fillRect(-4,-4,8,8)
  }else if(e.type==="deathBurst"){
   ctx.translate(e.x,e.y);ctx.strokeStyle=e.color;ctx.shadowBlur=24;ctx.shadowColor=e.color;ctx.lineWidth=4;
   const rr=(e.size||42)*(1.35-e.life);ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.stroke();
   ctx.globalAlpha*=.28;ctx.fillStyle=e.color;ctx.beginPath();ctx.arc(0,0,rr*.66,0,Math.PI*2);ctx.fill()
  }else if(e.type==="shard"){
   ctx.translate(e.x,e.y);ctx.fillStyle=e.color;ctx.shadowBlur=7;ctx.shadowColor=e.color;ctx.rotate(Math.atan2(e.vy||0,e.vx||1));const s=e.size||3;ctx.fillRect(-s*.5,-1,s*2.4,2)
  }else if(e.type==="rune"){
   const rr=(e.radius||52)*(1.25-e.life*.5);ctx.translate(e.x,e.y);ctx.strokeStyle=e.color;ctx.shadowBlur=20;ctx.shadowColor=e.color;ctx.lineWidth=3;
   ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.stroke();ctx.globalAlpha*=.65;ctx.beginPath();ctx.arc(0,0,rr*.64,0,Math.PI*2);ctx.stroke();
   ctx.rotate(performance.now()/800);for(let i=0;i<8;i++){const ang=i*Math.PI/4;ctx.fillStyle=i%2?"#fff":e.color;ctx.fillRect(Math.cos(ang)*rr-2,Math.sin(ang)*rr-2,4,4)}
  }else if(e.type==="ring"){
   ctx.strokeStyle=e.color;ctx.lineWidth=5;ctx.shadowBlur=14;ctx.shadowColor=e.color;ctx.beginPath();ctx.arc(e.x,e.y,(e.radius||52)*(1.15-e.life),0,Math.PI*2);ctx.stroke()
  }else if(e.type==="after"){
   ctx.fillStyle=e.color;ctx.globalAlpha*=.25;ctx.fillRect(e.x-12,e.y-45,24,50)
  }else if(e.type==="dust"){
   ctx.fillStyle=e.color;ctx.globalAlpha*=.5;ctx.fillRect(e.x,e.y,e.size||4,e.size||4)
  }else{
   ctx.fillStyle=e.color;ctx.shadowBlur=6;ctx.shadowColor=e.color;const s=e.size||3;ctx.fillRect(e.x,e.y,s,s)
  }ctx.restore()
 }
}

document.getElementById("versionBadge").textContent=APP_VERSION;
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));

window.addEventListener("resize",()=>window.ThreeFX?.resize?.());
