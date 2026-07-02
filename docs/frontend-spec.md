# Frontend UI Spec — Cup Predict

Target look: dark, deep-space theme with a **gold trophy** center and **cyan** interactive
accents (see the reference mockup). Real crest/trophy art is added later; v1 uses emoji flags
and a CSS/icon trophy.

## Layout (Bracket tab)

```
┌───────────────────────── Header ──────────────────────────┐
│ 🏆 Cup Predict      Bracket | Predictions      ● Solana  [Connect Wallet] │
└────────────────────────────────────────────────────────────┘

        [ Your bracket | Actual results ]   ← view toggle

  LEFT HALF                     CENTER                  RIGHT HALF
  R32 → R16 → QF → SF     [ Globe + Trophy ]     SF ← QF ← R16 ← R32
  (8    4    2   1)       [ Prize Pot: X SOL ]     (1   2    4    8)
                          [ Final · Your Champion ]
                          [ Bracket filled X/N ]
                          [ Place Prediction ]

┌──────────────────────────── Footer stats ─────────────────────────┐
│ Predicted champion | Bracket X/N | Status | Final (date + countdown) │
└────────────────────────────────────────────────────────────────┘
```

- The bracket is horizontally scrollable (32 teams is wide); centers when it fits.
- **View toggle** — "Your bracket" (your picks) ⇄ "Actual results" (real advancement only).

## Color language

- **Cyan** = what really happened — locked/played results and the "Actual results" view.
- **Gold** = your prediction (+ gold crown on your predicted champion in the center).

## Match card states

Cards resolve competitors from `{ ...RESULTS, ...yourPicks }`. Scores shown where a real result
exists.

| State | Appearance |
|-------|------------|
| **Played / locked** (real winner) | **Cyan** text + cyan check + score; **not clickable** |
| **Your pick** (unplayed match you predicted) | **Gold** text + gold check + gold card border |
| **Eliminated / lost** | Dimmed (~40% opacity) |
| **Not ready** (feeders unknown) | Neutral "TBD" |

In **"Actual results"** mode every card is read-only and shows only the real result (cyan) or TBD.

## Center (trophy + final + progress)

- **Trophy** (large gold image) centered over the globe background.
- **Prize Pot** card: pool in **SOL**, label "Closest bracket wins it all".
- **Final · Your Champion** box: the two finalists (from your semi-final picks); tap one to set
  your **champion** (gold crown). Hint until both semis are filled.
- **Progress bar**: "Bracket filled X / N".
- **CTA:** bracket incomplete → helper; complete → **Place Prediction**; locked → **Prediction
  Locked** + **New prediction**.

## Stake modal

- Shows **your predicted champion** (flag + name).
- **Stake (SOL)** number input + quick buttons `0.1 / 0.5 / 1`.
- **Validation:** below `0.1 SOL` → red error, confirm disabled.
- **Prize pool (100%):** the full stake amount (no buyback).
- **Confirm:**
  - Wallet not connected → "Connect wallet to continue" (opens wallet modal).
  - Connected → "Lock prediction · X SOL" → records prediction (mock; no SOL sent), toast,
    closes, bracket becomes **Locked**.

## Footer stats

| Stat | Source |
|------|--------|
| **Predicted champion** | your final pick (flag + code) or "—" |
| **Bracket** | matches predicted `X / N` |
| **Status** | Filling bracket / Ready to place / Locked |
| **Final** | the final's date (e.g. "Jul 19, 2026") + countdown ("17D 22H left") |

Mobile: on small screens the **center block (trophy + prize pot + final picker + progress)** moves
to the top, and the full bracket sits below in a horizontal scroll. The footer becomes a 2×2 grid.

## Predictions tab (My Predictions)

- List of submitted brackets, newest first. Each row: predicted champion (flag + name), wallet
  (short), time, **score** (correct/graded, or "Awaiting results"), stake, and a status badge
  (**Pending** / Won / Lost).
- Empty state when none yet.

## Chain selector

The reference mockup shows "Ethereum" — Cup Predict is **Solana**. v1 shows a static
**Solana** badge (green dot). A multi-chain selector is not in scope.

## Responsive / behavior notes

- Header tabs collapse below the logo on mobile.
- All picking is client-side and instant; state persists across reloads (localStorage).
