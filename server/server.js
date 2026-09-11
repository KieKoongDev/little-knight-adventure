const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const ROOT = path.resolve(__dirname, "..");
const PORT = process.env.PORT || 8081;
const rooms = new Map();
const reconnects = new Map();

function code() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i=0;i<6;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}
function id() { return Math.random().toString(36).slice(2,10); }
function send(ws,obj){ if(ws.readyState===1&&ws.bufferedAmount<262144) ws.send(JSON.stringify(obj)); }
function roomPlayers(room){
  return [...room.players.values()].map(p=>({playerId:p.id,name:p.name,hero:p.hero,isHost:p.id===room.hostId,ready:!!p.ready}));
}
function broadcast(room,obj,except=null){
  const raw=JSON.stringify(obj);
  for(const p of room.players.values()){
    const ws=p.ws;if(ws===except||!ws||ws.readyState!==1)continue;
    if(ws.bufferedAmount>262144)continue;
    ws.send(raw)
  }
}
function broadcastPlayers(room){ broadcast(room,{type:"room_players",players:roomPlayers(room)}); }

const server = http.createServer((req,res)=>{
  if(req.url==="/health"){res.writeHead(200,{"content-type":"application/json","cache-control":"no-store","access-control-allow-origin":"*"});return res.end(JSON.stringify({ok:true,rooms:rooms.size,version:"2.2.0"}))}
  let pathname = decodeURIComponent(req.url.split("?")[0]);
  if(pathname==="/") pathname="/index.html";
  const file=path.normalize(path.join(ROOT,pathname));
  if(!file.startsWith(ROOT)||file.includes(path.sep+"server"+path.sep)){res.writeHead(403);return res.end("Forbidden")}
  fs.readFile(file,(err,data)=>{
    if(err){
      if(!path.extname(pathname)){
        const fallback=path.join(ROOT,"index.html");
        return fs.readFile(fallback,(e,d)=>{if(e){res.writeHead(404);return res.end("Not found")}res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-cache"});res.end(d)})
      }
      res.writeHead(404);return res.end("Not found")
    }
    const ext=path.extname(file),types={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".webmanifest":"application/manifest+json"};
    res.writeHead(200,{"content-type":types[ext]||"application/octet-stream","cache-control":ext===".html"||path.basename(file)==="version-manifest.json"?"no-cache":"public, max-age=3600"});
    res.end(data)
  })
});

const wss = new WebSocketServer({server,path:"/ws"});
wss.on("connection",ws=>{
  ws.meta={roomCode:null,playerId:null};
  ws.on("message",raw=>{
    let m;try{m=JSON.parse(raw.toString())}catch{return}
    if(m.type==="create_room"){
      let c=code();while(rooms.has(c))c=code();
      const pid=id();const token=id()+id();const room={code:c,hostId:pid,players:new Map(),started:false,lastWorld:null,loot:new Map()};
      room.players.set(pid,{id:pid,ws,name:m.name||"Player",hero:m.hero||"ronin",state:null,ready:false,reconnectToken:token,downed:false});
      rooms.set(c,room);ws.meta={roomCode:c,playerId:pid};
      send(ws,{type:"room_joined",roomCode:c,playerId:pid,isHost:true,reconnectToken:token,players:roomPlayers(room)});
    } else if(m.type==="join_room"){
      const c=String(m.roomCode||"").toUpperCase(),room=rooms.get(c);
      if(!room)return send(ws,{type:"error",message:"Room not found"});
      if(room.players.size>=4)return send(ws,{type:"error",message:"Room full"});
      if(room.started)return send(ws,{type:"error",message:"Match already started"});
      const pid=id(),token=id()+id();room.players.set(pid,{id:pid,ws,name:m.name||"Player",hero:m.hero||"ronin",state:null,ready:false,reconnectToken:token,downed:false});ws.meta={roomCode:c,playerId:pid};
      send(ws,{type:"room_joined",roomCode:c,playerId:pid,isHost:false,reconnectToken:token,players:roomPlayers(room)});broadcastPlayers(room);
    } else if(m.type==="reconnect"){
      const rec=reconnects.get(m.token);if(!rec)return send(ws,{type:"error",message:"Reconnect expired"});
      const room=rooms.get(rec.roomCode);if(!room)return send(ws,{type:"error",message:"Room expired"});
      const p=rec.player;p.ws=ws;room.players.set(p.id,p);ws.meta={roomCode:room.code,playerId:p.id};reconnects.delete(m.token);
      send(ws,{type:"reconnected",roomCode:room.code,playerId:p.id,isHost:room.hostId===p.id,players:roomPlayers(room),started:room.started,world:room.lastWorld});
      broadcastPlayers(room);
    } else if(m.type==="ping"){
      send(ws,{type:"pong",t:m.t});
    } else {
      const room=rooms.get(ws.meta.roomCode),p=room?.players.get(ws.meta.playerId);if(!room||!p)return;
      if(m.type==="set_ready"){p.ready=!!m.ready;broadcast(room,{type:"ready_state",players:roomPlayers(room)})}
      else if(m.type==="start_match"&&room.hostId===p.id){
        const allReady=[...room.players.values()].every(x=>x.ready||x.id===room.hostId);
        if(!allReady)return send(ws,{type:"error",message:"All players must be ready"});
        room.started=true;broadcast(room,{type:"start_match"})
      }
      else if(m.type==="player_state"){p.state=m.state;broadcast(room,{type:"peer_state",playerId:p.id,state:m.state},ws)}
      else if(m.type==="world_snapshot"&&room.hostId===p.id){room.lastWorld=m.world;broadcast(room,{type:"world_snapshot",world:m.world},ws)}
      else if(m.type==="combat_action"){
        const host=room.players.get(room.hostId);if(host&&host.id!==p.id)send(host.ws,{type:"remote_action",playerId:p.id,action:m.action})
      } else if(m.type==="shared_loot_spawn"&&room.hostId===p.id){
        const loot=m.loot;if(loot?.id){room.loot.set(loot.id,loot);broadcast(room,{type:"shared_loot",loot},ws)}
      } else if(m.type==="collect_loot"){
        const loot=room.loot.get(m.lootId);if(!loot)return;
        room.loot.delete(m.lootId);broadcast(room,{type:"loot_collected",lootId:m.lootId,playerId:p.id,loot})
      } else if(m.type==="player_downed"){
        p.downed=true;broadcast(room,{type:"ally_downed",playerId:p.id,bleedout:m.bleedout||20})
      } else if(m.type==="revive_player"){
        const target=room.players.get(m.targetId);if(!target||!target.downed)return;
        target.downed=false;broadcast(room,{type:"ally_revived",playerId:target.id,hp:Math.max(40,Math.round((target.state?.maxHp||100)*.35))})
      } else if(m.type==="player_respawning"){
        p.downed=false;broadcast(room,{type:"ally_respawning",playerId:p.id,seconds:Math.max(1,Math.min(8,Number(m.seconds)||5))})
      } else if(m.type==="player_respawned"){
        p.downed=false;if(p.state){p.state.hp=m.hp||p.state.hp;p.state.x=m.x||105;p.state.y=m.y||440}
        broadcast(room,{type:"ally_respawned",playerId:p.id,hp:m.hp||50,x:m.x||105,y:m.y||440})
      } else if(m.type==="assist_event"){
        broadcast(room,{type:"assist",x:m.x,y:m.y,text:m.text||"CO-OP ASSIST"})
      } else if(m.type==="support_pulse"){
        broadcast(room,{type:"support_pulse",amount:Math.max(0,Math.min(50,Number(m.amount)||0))},ws)
      } else if(m.type==="team_ult_request"){
        const host=room.players.get(room.hostId);if(host&&host.id!==p.id)send(host.ws,{type:"team_ult_request",playerId:p.id})
      } else if(m.type==="team_ult_fire"&&room.hostId===p.id){
        broadcast(room,{type:"team_ult"},ws)
      }
    }
  });
  ws.on("close",()=>{
    const room=rooms.get(ws.meta.roomCode);if(!room)return;
    const p=room.players.get(ws.meta.playerId);if(!p)return;
    room.players.delete(p.id);broadcast(room,{type:"peer_left",playerId:p.id});
    reconnects.set(p.reconnectToken,{roomCode:room.code,player:p});
    setTimeout(()=>reconnects.delete(p.reconnectToken),15000);
    if(room.players.size===0){setTimeout(()=>{if(room.players.size===0)rooms.delete(room.code)},15000);return}
    if(room.hostId===p.id){room.hostId=room.players.keys().next().value;room.started=false;broadcast(room,{type:"host_changed",playerId:room.hostId})}
    broadcastPlayers(room);
  })
});

server.listen(PORT,()=>console.log(`Pixel Brawler server on :${PORT}`));
