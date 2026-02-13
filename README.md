# Planetes — Solar System Gravity Simulator

A 3D solar system simulation where you pilot a spacecraft through realistic Newtonian gravity. Built for physics students to explore gravitational dynamics of space travel.

## Features

- **Real orbital positions** — Planets are placed at their actual current locations using J2000 Keplerian orbital elements (JPL data) and revolve in real time
- **Newtonian gravity** — Your spacecraft experiences `a = GM/r²` from the Sun and all 9 planets, computed every frame
- **Per-body gravity HUD** — Live readout of distance and gravitational pull from every body, sorted by strength
- **Day/night shading** — Planets are illuminated by the Sun with a visible terminator
- **Time warp** — Slider from 1× to 10M× to observe orbital motion

## Controls

| Key | Action |
|-----|--------|
| W / S | Thrust forward / backward |
| A / D | Yaw left / right |
| Q / E | Roll left / right |
| Shift / Space | Pitch down / up |
| C | Toggle camera mode (chase / orbit) |
| Scroll | Zoom in / out |
| Slider | Adjust time warp |

## Running

Requires a local HTTP server (ES modules don't load via `file://`):

```bash
# Python
python -m http.server 8080

# Node
npx http-server -p 8080
```

Then open [http://localhost:8080](http://localhost:8080).

## Tech

- [Three.js](https://threejs.org/) r160 (loaded via CDN — no build step, no dependencies)
- Vanilla JavaScript ES modules
- Keplerian orbital mechanics for planet positions
- Newtonian gravitational physics for spacecraft
