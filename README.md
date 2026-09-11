# อัศวินจิ๋วผจญภัย v1.9.2 — Deploy Ready Online

เวอร์ชันนี้ทำมาเพื่อแก้ปัญหา Static hosting ไม่มี WebSocket โดยตรง

## วิธีที่แนะนำ: Deploy ทั้งเกมเป็น Node App ตัวเดียว
เมื่อ deploy แล้ว URL เดียวทำทุกอย่าง:
- หน้าเกม
- Assets
- `/health`
- WebSocket `/ws`
- Create Room
- Join Room
- Invite Link

ผู้เล่นไม่ต้องกรอก Game Server URL

## Local
```bash
npm install
npm start
```
เปิด:
`http://localhost:8081`

Health:
`http://localhost:8081/health`

WebSocket:
`ws://localhost:8081/ws`

## Render
โปรเจกต์มี `render.yaml` แล้ว

1. แตก ZIP แล้ว push ขึ้น GitHub
2. Render → New → Blueprint
3. เลือก repository
4. Render อ่าน `render.yaml`
5. Deploy
6. เปิด URL ที่ Render ให้มา

เกมจะใช้:
`wss://<render-domain>/ws`
อัตโนมัติ

## Railway
มี `Dockerfile` และ `railway.json`

1. Push repository
2. Railway → New Project → Deploy from GitHub
3. Generate Domain
4. เปิด domain

เกมจะ infer WebSocket จาก domain เดียวกันอัตโนมัติ

## Docker / VPS / EC2
```bash
docker build -t little-knight .
docker run -p 8081:8081 -e PORT=8081 little-knight
```

แล้ว reverse proxy HTTPS มาที่ port 8081

## Netlify เดิม
Netlify static ยังใช้เล่น Solo ได้ แต่ไม่ควรเป็น URL หลักสำหรับ Online build นี้
สำหรับ Create Room ให้เปิดเกมจาก Render/Railway/Node URL แทน

## UX
ช่อง Game Server ถูกซ่อนไว้เป็น Advanced Setting
ค่า default คือโดเมนเดียวกับเกม เช่น:
`https://game.example.com` → `wss://game.example.com/ws`
