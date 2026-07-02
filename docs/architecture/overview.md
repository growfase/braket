# Architecture Overview

## Guiding principle

Ship value in **phases**, each independently useful. The frontend is built first against a
**mock** so the product and UX are validated before any money or backend is involved. Money
(real SOL), persistence (Supabase), and trust-minimization (on-chain program) are layered in
afterwards without reworking the UI.

## Phases & data flow

```
Phase 1 (DONE)   Frontend + mock
  Wallet connect (Phantom) ──▶ React app ──▶ local state + localStorage
                                   │
                                   └── prize pool, predictions: MOCK (no chain, no DB)

Phase 2          Real payment (no backend)
  App ──▶ build a SOL transfer (stake) ──▶ user signs in Phantom ──▶ devnet
                                   └── treasury wallet receives 100% of the stake (the pool)

Phase 3          Backend persistence (Supabase)
  App ──▶ Supabase (Auth via SIWS, Postgres) ──▶ predictions, pools, tournament, results
  App ──▶ Supabase Edge Functions ──▶ build/confirm tx, settle, payout bookkeeping

Phase 4          On-chain program (Anchor)
  App ──▶ program instructions ──▶ prediction registry + prize-pool vault
  Oracle/admin ──▶ settle ──▶ trust-minimized winner-takes-all payout

Phase 5          Mainnet hardening
  Audits, limits, geoblocking, monitoring.
```

## Component boundaries

| Layer | Responsibility | Phase |
|-------|----------------|-------|
| **Frontend** (`app/`) | Bracket UX, wallet connect, stake modal, view predictions | 1 |
| **Wallet** | Identity + signing (Phantom / Wallet Standard) | 1 (connect), 2 (sign) |
| **Treasury wallet** | Receives stakes; source of manual payouts | 2 |
| **Supabase** | Auth, source-of-truth data, edge functions | 3 |
| **Anchor program** (`programs/braket`) | Trust-minimized stakes, pool/vault, settlement | 4 |

## Key design choices

- **Full-bracket challenge, winner-takes-all.** Each player predicts every remaining match
  (already-played matches are locked to reality); score = 1 pt per correct winner; the single
  closest bracket takes the whole pool. See [economics.md](../product/economics.md).
- **100% of the stake funds the pool** (no buyback) — see [economics.md](../product/economics.md).
- **Manual payout** early (a wallet the operator controls), automated on-chain later.
- **Mock-first frontend** — the `prediction-store` is the single seam; swapping its internals
  from localStorage → Supabase → program calls is the migration path, and the UI is unchanged.

## The migration seam

Everything the app knows about predictions/pool goes through
[`app/src/lib/prediction-store.tsx`](../../app/src/lib/prediction-store.tsx). Later phases
replace the body of `submit()` and the data source, not the components that consume the store.
