# Frontend Architecture

## Stack

| Concern | Choice |
|---------|--------|
| Framework | **React 18** + TypeScript |
| Build tool | **Vite 6** |
| Styling | **Tailwind CSS 4** (`@tailwindcss/vite`, tokens via `@theme` in `index.css`) |
| Icons | `lucide-react` |
| Toasts | `sonner` |
| Wallet | `@solana/wallet-adapter-*` (Phantom / Wallet Standard) + `@solana/web3.js` |
| State | React Context + `localStorage` (no backend in v1) |

> Mirrors the MascotsWars stack. React is pinned to 18 for smooth wallet-adapter peer
> compatibility. `buffer` is polyfilled (`src/polyfills.ts`) because Solana libs expect it.

## Run it

```bash
cd app
yarn install
yarn dev        # http://localhost:5173
yarn build      # typecheck + production build
yarn typecheck  # types only
```

## Folder layout

```
app/src/
  main.tsx                 App root: WalletProvider → PredictionProvider → App + Toaster
  App.tsx                  Tab switch: Bracket | Predictions
  index.css                Tailwind import + theme tokens (dark, gold, cyan)
  polyfills.ts             Buffer global for Solana libs
  lib/
    types.ts               Team, Match, MatchSlot, BracketPicks, Prediction
    config.ts              MIN_STAKE_SOL, deadline, storage key, cluster
    format.ts              SOL / address / countdown / relative-time formatting
    tournament-data.ts     16 teams + 15-match bracket structure + (empty) RESULTS
    bracket-logic.ts       resolve competitors, apply/prune picks, champion, grading
    wallet-provider.tsx    Solana connection + wallet-adapter providers (devnet)
    prediction-store.tsx   THE state seam: picks, locked, predictions, poolSol + actions
  components/
    ui/                    button, card/badge, modal (lightweight, no radix)
    layout/                header (logo, tabs, chain badge, connect), footer-stats
    bracket/               bracket-view, bracket-side, match-card, center-trophy
    predict/               stake-modal
    predictions/           my-predictions
```

## Data model (mock)

- **Bracket structure** is static data in `tournament-data.ts`: 16 `TEAMS` and 15 `MATCHES`.
  Each match slot is either a **seeded team** (`teamId`) or the **winner of a feeder match**
  (`from`). This models R16 → QF → SF → Final as a graph.
- **Picks** are `Record<matchId, winningTeamId>`. `bracket-logic.ts`:
  - `matchCompetitors` resolves who currently plays a match given picks.
  - `applyPick` sets a winner and **prunes** downstream picks that become invalid (e.g. you
    changed a QF winner, so the SF pick that relied on the old team is cleared).
  - `getChampionId` = winner of the final; `isBracketComplete` = every unplayed match predicted.
- **Predictions & pool** live in `prediction-store.tsx`, persisted to `localStorage`
  (`cup-predict:v1`). `submit()` validates (wallet + min stake + complete bracket), records the
  prediction, locks the draft, and adds the **full stake** (100%) to the mock pool.

## State seam (why it matters)

`prediction-store.tsx` is the **only** place that knows *how* predictions are stored and paid.
In later phases:

- **Phase 2:** `submit()` also builds + sends a real SOL transfer before recording.
- **Phase 3:** the store reads/writes **Supabase** instead of localStorage.
- **Phase 4:** `submit()` calls **Anchor program** instructions.

Components (`bracket/`, `predict/`, `predictions/`, `layout/`) never change for these.

## Theming

Design tokens are CSS variables in `index.css` under `@theme` (Tailwind v4), so classes like
`text-gold`, `bg-panel`, `border-cyan` work directly. Palette: deep-space navy background,
**gold** trophy/prize accents, **cyan** interactive accents. Flags are emoji placeholders;
real crest/trophy art drops into `components` + `assets` later without structural change.
