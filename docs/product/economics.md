# Economics — Cup Predict

## Stake → 100% prize pool

**Every stake goes entirely (100%) into the prize pool.** There is no buyback and no house cut
in v1 — the pool is the sum of all stakes, paid out **winner-takes-all**.

## Prize pool — winner-takes-all

- The prize pool is the running sum of **all** stakes (100% each).
- **Scoring:** every submitted bracket earns **1 point per correct match winner** (all 31
  matches equal weight; already-played matches are locked to reality for everyone).
- **Winner:** the **single bracket with the highest score** takes the **entire** prize pool.
- **Match ties don't exist** — knockout matches are decided (penalties if needed).
- **Player-score ties** (two brackets with the same score) are possible; default resolution is
  to **split the pool equally** among the top scorers. **TBD** — see open questions.
- Executed manually in the early phase, automated on-chain later.

## Minimum stake

- **0.1 SOL** per prediction (enforced in the UI now; enforced on-chain later).

## Worked example

Assume 3 players submit brackets; after the tournament their correct-match counts are:

| Wallet | Stake | → Prize pool (100%) | Score (correct matches) | Result |
|--------|-------|---------------------|-------------------------|--------|
| A | 1.0 | 1.00 | 24 / 31 | 🏆 closest |
| B | 0.5 | 0.50 | 21 / 31 | — |
| C | 0.2 | 0.20 | 19 / 31 | — |
| **Total** | **1.7** | **1.70** | | |

Prize pool = **1.70 SOL** → **all of it goes to A** (highest score). Stake size does **not**
change the payout — it's winner-takes-all by score, not pari-mutuel.

## Accounting notes (for later on-chain design)

- The house **never takes market risk** on the pool — it holds stakes and pays the winner.
- Track **gross stake** and **pool balance**.
- If a platform fee is ever introduced, take it **before** funding the pool and document it here.

## Open questions

1. ~~Payout model~~ — **DECIDED: winner-takes-all (closest bracket by score).**
2. ~~Stake split~~ — **DECIDED: 100% to the prize pool (no buyback).**
3. Player-score tie-break: **split equally** (default) vs **earliest submission**?
4. Is there a platform fee, or is the pool pure pass-through?
