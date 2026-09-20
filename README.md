# omni.games Hub

Foundational platform for the **omni.games** arcade ecosystem — a retro-cyber launcher for Omnistrata titles.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5175](http://localhost:5175) (port 5175 so CoverIQ can use 5173).

From CoverIQ local dev: [http://localhost:5173/arcade](http://localhost:5173/arcade) after running `npm run dev:all` in `coveriq-site`.

## What's included

- Immersive landing page with CRT, particles, and synthwave grid
- Featured & coming-soon game cards (arcade cabinet style)
- **Cabinet launcher** — click a game to open a closable window; switch tabs between Arcade and open games
- Per-game deep links (`/games/:slug` → opens cabinet)
- Modular React architecture ready for auth, leaderboards, and more
- Multi-repo planning docs in `/docs`

## Playable games

| Game | Slug | Notes |
|------|------|--------|
| **Policy Quest** (flagship) | `policy-quest` | Full game embedded from `public/games/policy-quest/` |
| **Car Planet** | `car-planet` | Full game embedded from `public/games/car-planet/` |
| **Auto World** | `auto-world` | Full game embedded from `public/games/auto-world/` (13+ DOB gate) |
| Uninsured Mayhem | `uninsured-mayhem` | Highway dodge arcade (Car Planet-style pixels) |
| Claim Chaos | `claim-chaos` | Dealership disaster claims |
| Risk Rush | `risk-rush` | Lane reaction / risk timing |
| Agent Mode | `agent-mode` | Walk the lot, sell policies |

Click a card → cabinet opens. Use **D-pad + A/B** (or keyboard arrows + Z/Space). **Full Screen** fills the device; **×** in the top-left returns to Arcade.

## Project structure

```
src/
├── app/           # Router & shell
├── components/    # ui, layout, arcade, effects
├── data/          # Game catalog
├── features/      # Page sections
├── pages/         # Route pages
├── styles/        # Design tokens & globals
└── types/         # Shared TypeScript types
```

## Docs

- [Repository Architecture](./docs/REPOSITORY_ARCHITECTURE.md)
- [CoverIQ Integration](./docs/COVERIQ_INTEGRATION.md)

## Tech stack

- React 19 + TypeScript
- Vite
- React Router
- Framer Motion

---

Part of the **Omnistrata** ecosystem.
