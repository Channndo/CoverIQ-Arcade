# CoverIQ Arcade × omni.games Integration

CoverIQ Arcade can act as a themed portal into the omni.games ecosystem. This hub is designed for future crossover without coupling game code.

## Integration goals

1. **Feature & select** omni.games titles relevant to insurance/arcade themes
2. **Embed** game builds via URL or web component
3. **Share branding** through `shared-ui-components` tokens
4. **Crossover experiences** — shared events, achievements (future)

## Game metadata flag

Each game in `src/data/games.ts` includes `coverIQCompatible: true`. Filter with:

```ts
GAMES.filter((g) => g.coverIQCompatible)
```

## Hub cabinet launcher

The hub opens games in an in-app **cabinet window** (iframe when `playUrl` is set on the game). Users can:

- Close any game with **×** or the tab close control
- Press **Esc** to return to the Arcade browse view without closing tabs
- Switch between **Arcade** and multiple open game tabs

Set `playUrl` in `src/data/games.ts` (or manifest) when a game repo is deployed:

```ts
{ slug: 'uninsured-mayhem', status: 'beta', playUrl: 'https://uninsured-mayhem.omni.games/' }
```

## Embedding pattern (CoverIQ shell)

```html
<iframe
  src="https://games.omni.games/uninsured-mayhem/"
  title="Uninsured Mayhem"
  class="coveriq-game-frame"
/>
```

Or reuse the same `playUrl` contract from each game's `omni.manifest.json`.

## Brand alignment

Use the same CSS custom properties from `src/styles/tokens.css`:

- `--omni-neon-cyan`, `--omni-neon-pink`, `--omni-bg-deep`
- Fonts: Orbitron, Press Start 2P, Rajdhani

Extract to `shared-ui-components` when splitting repos.

## Recommended CoverIQ flow

1. CoverIQ landing → curated grid of `coverIQCompatible` games
2. Deep link to hub game page: `/games/{slug}`
3. On launch, redirect to game's standalone repo URL

## This workspace

The CoverIQ Arcade folder currently hosts **omni-games-hub**. Rename or split when creating a dedicated CoverIQ shell repo.
