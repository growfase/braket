# Product Concept — Cup Predict

## One-liner

Predict the whole bracket. Stake SOL. The bracket closest to reality wins the entire pot.

## The idea

Cup Predict is a **bracket-challenge** game around a knockout tournament (e.g. a World
Cup). The tournament has **32 teams** and plays out as single elimination:

```
Round of 32 (16 matches) → Round of 16 (8) → Quarter Finals (4) → Semi Finals (2) → Final (1)  = 31 matches
```

Each player **predicts the whole bracket** — the winner of every match, cascading up to a
champion. Matches that have **already been played are locked** to their real result (you can't
predict the past); the player fills in the **remaining matches**. As real results come in, each
bracket is scored: **1 point per correct match winner**. The bracket **closest to reality (most
correct) wins the ENTIRE prize pool** — winner-takes-all (see [economics.md](economics.md)).

## Core rules

- **Currency:** SOL (Solana).
- **Minimum stake:** **0.1 SOL** per prediction.
- **What you predict:** the **whole bracket** (winner of every remaining match → champion).
- **Locked matches:** already-played matches are fixed to the real result; you predict the rest.
- **Scoring:** **1 point per correct match winner** (all matches equal weight).
- **Winner:** the **single bracket closest to reality** takes the **entire** prize pool
  (winner-takes-all). No match ties (knockout → penalties decide).
- **Stake → pool:** **100% of every stake funds the prize pool** (no buyback)
  (see [economics.md](economics.md)).

## User journey

1. **Connect wallet** (Phantom / any Solana Standard wallet).
2. **Fill your bracket** — pick the winner of every remaining match; picks cascade to the next
   round. Already-played matches are shown locked (real result, cyan).
3. **Crown your champion** — the last pick (the final) sets your predicted champion.
4. **Place prediction** — choose a stake (≥ 0.1 SOL); 100% funds the pool, confirm.
5. **Locked** — the prediction is recorded ("Prediction Locked").
6. **Track** — see it under **My Predictions** with your live score.
7. **Settle** — as results come in, brackets are scored; the closest wins the whole pot.

## Screen map (v1)

- **Bracket** tab — the two-sided bracket with a **"Your bracket" ⇄ "Actual results"** toggle,
  the trophy + prize pot + final/champion picker in the center, and a footer (predicted champion,
  bracket progress, status, final date).
- **Predictions** tab ("My Predictions") — the user's submitted brackets with predicted champion,
  stake, timestamp, and score.

## States

| State | Meaning |
|-------|---------|
| **Filling bracket** | Not every remaining match is predicted; "Place Prediction" disabled. |
| **Ready to place** | Whole bracket filled (champion decided); "Place Prediction" enabled. |
| **Prediction Locked** | A bracket was submitted; picks read-only. "New prediction" resets. |
| **Pending** | Submitted; results still coming in. |
| **Won / Lost** | After settlement — closest bracket or not. |

## Out of scope (this phase)

Real on-chain payment, backend persistence, automated settlement, KYC/geoblocking, multiple
concurrent tournaments. Tracked in [roadmap.md](../roadmap.md).
