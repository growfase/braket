# On-chain & Backend Design (FUTURE — not built yet)

> ⚠️ **Nothing in this doc is implemented.** It's the target design for Phases 3–4 so the
> frontend seam (`prediction-store.tsx`) and data shapes are built toward it. The Anchor
> program in `programs/braket` is currently a stub.

## Supabase (Phase 3)

### Auth
- **Sign-In With Solana (SIWS):** user signs a message with Phantom; an Edge Function verifies
  the signature and opens a Supabase session. No email/password.

### Tables (sketch)

```
tournaments      id, name, status(open|locked|settled), lock_at, champion_team_id?
teams            id, tournament_id, code, name, flag/crest_url, seed, side
matches          id, tournament_id, round, side, slot_a, slot_b, result_team_id?
predictions      id, tournament_id, wallet, champion_team_id, picks(jsonb),
                 stake_lamports, tx_sig?, status(pending|won|lost), created_at
pools            tournament_id, prize_lamports  (running total = sum of all stakes)
payouts          id, prediction_id, amount_lamports, tx_sig, paid_at   (manual→auto)
```

### Views / RPC
- `view_public_pool` — live prize pool total per tournament.
- `fn_create_prediction(...)` — validate champion + min stake, insert, bump pool.
- `fn_grade_tournament(...)` — on settlement, mark winners (champion match).

### Edge Functions
- `verify-wallet-signature` — SIWS.
- `build-stake-tx` / `confirm-stake-tx` — construct + confirm the SOL transfer (Phase 2/3).
- `settle-tournament` — set results/champion, grade predictions.
- `record-payout` — bookkeeping for manual payouts (later: trigger on-chain payout).

## Anchor program (Phase 4)

Program: `programs/braket` (Solana, Anchor 0.30.1). Design goals: **house takes no market
risk**, funds custody is transparent, settlement is authority-gated.

### Accounts (PDAs, sketch)
- **Config** — admin authority, min stake, treasury/vault authority.
- **Tournament** — status, lock timestamp, per-match results (the answer key), top score.
- **Vault** (program-owned) — holds the **prize-pool** lamports.
- **Prediction** — per (wallet, tournament): full bracket (winner per match), stake, score,
  claimed flag.

### Instructions (sketch)
- `initialize_config`
- `create_tournament` / `lock_tournament`
- `place_prediction` — transfers the stake; routes **100%** to the prize-pool vault; records the
  **full bracket**. Enforces **min 0.1 SOL** on-chain.
- `record_result` (authority/oracle) — set each match result as it's played; brackets are scored
  (**1 pt per correct winner**).
- `settle_tournament` (authority) — finalize the top score / winning prediction.
- `claim_reward` — the **winning** (highest-score) bracket claims the **entire** pool from the
  vault — **winner-takes-all**; see [economics.md](../product/economics.md). Player-score ties →
  split equally among top scorers (TBD). Likely authority-driven in the early phase.

### Security notes (carried from the scaffold)
- `init-if-needed` stays **disabled**; every account is created explicitly.
- Debit the vault by direct lamport math, keeping its rent reserve intact.
- Validate all account ownership/seeds; never trust client-provided amounts beyond the
  on-chain min/max guards.

## Pool

**100% of every stake** accrues to the prize-pool vault; the whole pool is paid to the winning
(closest) bracket. No buyback and no house cut in v1 (a platform fee remains an open question).
