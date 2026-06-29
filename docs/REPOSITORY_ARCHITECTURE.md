# omni.games Repository Architecture

This document defines the multi-repository structure for the omni.games ecosystem. Each game and shared system lives in its own repo for independent deployment while sharing visual and architectural conventions.

## Hub (this project)

| Repository | Purpose |
|------------|---------|
| `omni-games-hub` | Platform launcher, catalog, branding, routing to games |

**Current workspace:** This folder maps to `omni-games-hub` (also used as CoverIQ Arcade integration point).

## Game repositories

| Repository | Title | Genre |
|------------|-------|-------|
| `uninsured-mayhem` | Uninsured Mayhem | Arcade Action |
| `claim-chaos` | Claim Chaos | Survival Defense |
| `risk-rush` | Risk Rush | Reaction Arcade |
| `agent-mode` | Agent Mode | Tycoon Sim |
| `car-planet` | Car Planet | Collection RPG (flagship) |

Each game repo should:

- Use the shared design tokens from `shared-ui-components`
- Expose a build artifact embeddable via iframe or module federation (future)
- Register metadata compatible with `src/types/game.ts` in the hub

## Shared repositories

| Repository | Purpose |
|------------|---------|
| `shared-ui-components` | Buttons, cards, arcade cabinet, CRT effects |
| `shared-assets` | Logos, sfx, music, pixel art packs |
| `shared-auth-system` | Future auth, profiles, cloud saves |

## Folder conventions (per game repo)

```
game-name/
├── src/
│   ├── game/          # Core gameplay (future)
│   ├── assets/
│   └── main.tsx
├── package.json
└── omni.manifest.json # Slug, colors, CoverIQ flags
```

## Deployment model

- **Hub:** Static host (Vercel, Netlify, etc.)
- **Games:** Independent URLs; hub links or embeds
- **CoverIQ Arcade:** Curates subset of titles; shared branding via `shared-ui-components`

## Future platform services (not implemented)

Planned integration points in the hub:

- `src/services/auth` — session, OAuth
- `src/services/leaderboards` — scores API
- `src/services/achievements` — unlock sync
- `src/services/multiplayer` — lobby/matchmaking

Keep these as stubs until backend is scoped.
