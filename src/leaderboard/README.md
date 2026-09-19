# Arcade leaderboards + account-gated local save

Isolated client module. CoverIQ accounts stay on cover-iq.com (Syntrix).
This hub does **not** invent a second login and does **not** store passwords,
emails, or tokens in `localStorage`.

## What shipped

1. **Identity handshake** — when the hub is iframed from CoverIQ `/arcade`,
   the parent posts a public handle + in-memory session token. Games receive
   a token-less identity only.
2. **Car Planet local save gate** — `serviceBaySave` still writes to
   `localStorage` exactly as before, but only when the player is signed in.
   Existing saves are never wiped. Load/Continue still works for anyone who
   already has a file. If the leaderboard API is down, signed-in local save
   still works (fail-open).
3. **Leaderboards** — public boards on this hub. POSTs go to
   `https://cover-iq.com/api/arcade-stats` (override with `VITE_ARCADE_STATS_URL`).
   Only allow-listed numeric snapshots (day, CSI, ROs, fights won). The full
   Car Planet save blob is never uploaded.

## Identity (no shared cookie today)

| Context | Signed-in? | Local save |
|---|---|---|
| Embedded on cover-iq.com `/arcade` with a CoverIQ session | yes | enabled |
| Embedded, signed out | no | disabled + account prompt |
| Standalone GH Pages / local hub | no parent identity | disabled + link to CoverIQ signup |

## Future online play (not in this ship)

Keep using the opaque `userRef` minted by the site API and append-only stat
events. Later:

- `arcade_sessions` / match rooms keyed by `playerId` + `gameSlug`
- matchmaking as a new route that never writes CoverIQ auth tables
- optional cloud save as a **separate** opt-in blob store, not a replacement
  for `serviceBaySave`

Do not fold multiplayer into Car Planet or Auto World game loops until that
session layer exists.
