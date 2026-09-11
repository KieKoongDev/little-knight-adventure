# อัศวินจิ๋วผจญภัย v2.0.0 — Combat Fix + Aggressive Visual Pass

## Critical fixes
- Enemy death no longer blocks stage clear.
- Dead enemies get independent `deathTime` and are forcibly removed after ~0.92s.
- Stage clear checks `all enemies dead/remove`, not raw array length.
- Remote snapshots prune dead enemies safely.

## Network / Ping
- Player state ~18Hz -> ~12Hz.
- World snapshot 10Hz -> ~5.5Hz.
- Ping probe every 5s instead of 2.5s.
- Enemy snapshots now carry stable IDs.
- Remote enemies merge + interpolate instead of replacing the whole array.
- Server skips clients with large WebSocket bufferedAmount to avoid message queue buildup.
- Server serializes broadcasts once per message.

## Visual / Action
- Heavier multi-layer weapon trails.
- Motion-smear weapon overlay.
- Stronger heavy weapon dust/shock.
- Enemy attack telegraphs: melee cone / ranged line.
- Enemy death burst + dissolve / shard particles.
- Cinematic vignette/color grade.
- Boss red atmosphere.
- More weight on third combo attack.
- Landing dust and stronger hit-stop.

## Music
- Master 0.88
- Music 0.60
- Drums / bass / lead raised
- Dynamic intensity remains active.

## Concept
`concept/v2_aggressive_art_direction.webp` is the visual direction reference for future unique hand-authored hero/enemy/weapon sprite sheets.
