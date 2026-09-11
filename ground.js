// Visible terrain and movement share the same boundary. z is height above this surface.
const GROUND_PROFILES=[
 {edge:[438,417,423,409,425,416,440],base:"#3b3430",light:"#7a6658",seam:"#251f1d"},
 {edge:[430,420,408,418,409,422,435],base:"#303933",light:"#647061",seam:"#1d2725"},
 {edge:[444,433,415,413,420,435,446],base:"#46382f",light:"#927458",seam:"#2c2422"},
 {edge:[436,420,409,417,412,424,440],base:"#39434a",light:"#7a8c94",seam:"#202e38"}
];
const groundCache=new Map();
function groundEdge(x,index=stageIndex){const points=GROUND_PROFILES[index%4].edge,t=clamp(x/1280,0,1)*(points.length-1),i=Math.min(points.length-2,Math.floor(t));return points[i]+(points[i+1]-points[i])*(t-i)}
function constrainToGround(o){if(!o||!Number.isFinite(o.x)||!Number.isFinite(o.y))return;o.x=clamp(o.x,55,1235);o.y=clamp(o.y,groundEdge(o.x)+24,641)}
function constrainWorld(){for(const o of [player,...enemies,...drops,...stageObjects,...NET.peers.values()])constrainToGround(o)}
function drawGround(){
 if(!groundCache.has(stageIndex)){
  const canvas=document.createElement("canvas");canvas.width=1280;canvas.height=720;const c=canvas.getContext("2d"),p=GROUND_PROFILES[stageIndex%4];
  let seed=281+stageIndex*197;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  c.beginPath();p.edge.forEach((y,i)=>i?c.lineTo(i*1280/6,y):c.moveTo(0,y));c.lineTo(1280,720);c.lineTo(0,720);c.closePath();c.save();c.clip();
  c.fillStyle=p.base;c.fillRect(0,400,1280,320);
  // Individually shaded, irregular stones widen toward the camera.
  let y=397,row=0;
  const project=(x,y)=>640+(x-640)*((y-270)/450);
  while(y<720){const h=18+row*5,w=145;for(let x=-1800;x<3000;x+=w){const left=x+(row%2)*w*.5;
   const x1=project(left,y),x2=project(left+w,y),x3=project(left+w,y+h),x4=project(left,y+h);
   const grad=c.createLinearGradient(x1,y,x3,y+h);grad.addColorStop(0,p.light);grad.addColorStop(1,p.base);c.fillStyle=grad;c.strokeStyle=p.seam;c.lineWidth=1.7;
   c.beginPath();c.moveTo(x1+2,y+2);c.lineTo(x2-2,y+2);c.lineTo(x3-2,y+h-2);c.lineTo(x4+2,y+h-2);c.closePath();c.fill();c.stroke();
   c.globalAlpha=.18;c.strokeStyle="#c4bdac";c.lineWidth=1;c.beginPath();c.moveTo(x1+4,y+4);c.lineTo(x2-4,y+4);c.stroke();c.globalAlpha=1;
   if(rand()<.4){c.strokeStyle=p.seam;c.beginPath();c.moveTo(project(left+w*.4,y),y+2);c.lineTo(project(left+w*.53,y+h*.5),y+h*.5);c.lineTo(project(left+w*.45,y+h*.7),y+h*.7);c.stroke()}
  }y+=h;row++}
  for(let i=0;i<2300;i++){const x=rand()*1280,y=415+rand()*305;c.globalAlpha=.08+rand()*.13;c.fillStyle=i%2?p.light:p.seam;c.fillRect(x,y,1+rand()*3,1+rand()*2)}c.globalAlpha=1;
  const shade=c.createLinearGradient(0,415,0,720);shade.addColorStop(0,"rgba(7,13,19,.35)");shade.addColorStop(.45,"rgba(7,13,19,.06)");shade.addColorStop(1,"rgba(7,13,19,.58)");c.fillStyle=shade;c.fillRect(0,400,1280,320);c.restore();
  // Low rubble edge makes the rear wall visibly separate from the walkable surface.
  for(let x=0;x<1280;x+=19+rand()*15){const edge=groundEdge(x),w=15+rand()*24;c.fillStyle=p.seam;c.beginPath();c.moveTo(x,edge+4);c.lineTo(x+3,edge-5-rand()*6);c.lineTo(x+w*.7,edge-7);c.lineTo(x+w,edge+3);c.closePath();c.fill();c.strokeStyle=p.light;c.globalAlpha=.45;c.lineWidth=1;c.stroke();c.globalAlpha=1}
  groundCache.set(stageIndex,canvas);
 }ctx.drawImage(groundCache.get(stageIndex),0,0);
}
