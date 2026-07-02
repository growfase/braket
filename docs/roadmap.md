# Roadmap — Cup Predict

Phased delivery. Each phase is shippable and de-risks the next.

## Phase 1 — Frontend v1 (DONE)

- React + Vite + Tailwind app in `app/`.
- Two-sided **bracket** (32 teams / 31 matches), full-bracket prediction (played matches locked).
- **Wallet connect** (Phantom / Wallet Standard) — identity only.
- **Submit modal**: mini-bracket review, min 0.1 SOL, 100%-to-pool display, validation.
- Prediction flow **mocked** in `prediction-store` + `localStorage`; mock prize pool.
- **My Predictions** tab. Footer live stats.
- Verified: typecheck, production build, full pick→champion→lock flow in the preview.

## Phase 2 — Real payment (devnet, no backend)

- Build a real **SOL transfer** of the stake to a **treasury wallet**; user signs in Phantom.
- Confirm on-chain, then record the (still local) prediction with the tx signature.
- Configure `TREASURY_ADDRESS` and RPC in `app/src/lib/config.ts`.
- 100% of the stake goes to the pool (treasury holds it until settlement).

## Phase 3 — Backend (Supabase)

- New Supabase project (URL + anon key → `app` env; MCP ref in `.mcp.json`).
- **SIWS auth**; tables for tournaments/teams/matches/predictions/pools/payouts.
- Move `prediction-store` reads/writes from localStorage → Supabase.
- Edge Functions: verify signature, build/confirm stake tx, settle tournament, record payouts.
- Admin/oracle path to set match results + champion; compute winners.

## Phase 4 — On-chain program (Anchor)

- Implement `programs/braket`: config, tournament, vault (prize pool), prediction accounts.
- `place_prediction` routes 100% to the vault and enforces min stake on-chain.
- `settle_tournament` + `claim_reward` (or authority payout) for trust-minimized settlement.
- See [architecture/onchain-backend.md](architecture/onchain-backend.md).

## Phase 5 — Mainnet hardening

- Security review/audit of the program.
- Stake limits, region/age gating, terms & risk disclosures.
- Monitoring, analytics, error tracking.
- Real crest/trophy art, polish, marketing site/landing.

## Cross-cutting decisions to lock before Phase 3/4

- ✅ Game model: **full-bracket challenge** — predict every remaining match; already-played
  matches locked to the real result — decided.
- ✅ Scoring: **1 point per correct match winner** — decided.
- ✅ Payout: **winner-takes-all** — the single closest bracket takes the whole pool — decided.
- ✅ Stake → **100% to the prize pool** (no buyback) — decided.
- Player-score tie-break: **split equally** (default) vs **earliest submission**.
- Platform fee: yes/no (the pool is pure pass-through today).
- Multiple concurrent tournaments; grading cadence (live vs at settlement).
