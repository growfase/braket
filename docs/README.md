# Cup Predict — Documentation

**Cup Predict** is a Web3 prediction game on **Solana**: users predict the **champion**
of a 16-team knockout cup, pay in **SOL** (min **0.1**), and the players who correctly
picked the champion share a **prize pool** that is divided **manually** at the end.

**100% of each stake funds the prize pool** (winner-takes-all; no buyback).

## Index

| Doc | What's inside |
|-----|----------------|
| [product/concept.md](product/concept.md) | Product concept, user journey, rules, states |
| [product/economics.md](product/economics.md) | Stake → pool, prize pool, payout, worked examples |
| [architecture/overview.md](architecture/overview.md) | System phases, data flow, component boundaries |
| [architecture/frontend.md](architecture/frontend.md) | Frontend stack, structure, state model |
| [architecture/onchain-backend.md](architecture/onchain-backend.md) | **Future** program + Supabase design (not built yet) |
| [frontend-spec.md](frontend-spec.md) | UI spec: bracket, colors, states, footer |
| [roadmap.md](roadmap.md) | Phased delivery plan |

## Status (current phase)

- ✅ **Phase 1 — Frontend v1** (this delivery): bracket UI + My Predictions, wallet
  *connect* (Phantom), prediction flow **mocked** in local state. No on-chain tx, no backend.
- ⏳ Next: real SOL transfer → Supabase persistence → Anchor program → mainnet.

See [roadmap.md](roadmap.md) for the full sequence.

## Repo layout (relevant to Cup Predict)

```
app/                 Frontend (React + Vite + Tailwind) — the v1 delivered here
programs/braket/     Anchor/Solana program (stub — logic comes in a later phase)
docs/                This documentation
```
