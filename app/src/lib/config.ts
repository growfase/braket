/**
 * Cup Predict — app configuration.
 *
 * v1 is a mock/stub: no real SOL transfer, no backend. These constants also
 * document the economic rules that the on-chain program + backend will enforce
 * in later phases (see docs/product/economics.md).
 */

/** Minimum stake per prediction. */
export const MIN_STAKE_SOL = 0.1;

/** 100% of every stake funds the prize pool (no buyback, no house cut in v1). */

/** Convenience quick-stake buttons in the stake modal. */
export const QUICK_STAKES = [0.1, 0.5, 1] as const;

/** Placeholder — the real treasury pubkey wires in when we enable on-chain tx. */
export const TREASURY_ADDRESS = "REPLACE_WITH_TREASURY_PUBKEY";

/** Network used for the wallet connection. */
export const SOLANA_CLUSTER: "devnet" | "mainnet-beta" = "devnet";

export const TOURNAMENT_NAME = "World Cup";

/** Date of the final / prediction deadline — shown in the footer "Final" stat. */
export const PREDICTION_DEADLINE = new Date("2026-07-19T18:00:00Z").getTime();

/** Total matches in a 16-team single-elimination bracket. */
export const TOTAL_MATCHES = 15;

/** localStorage key for the persisted store. */
export const STORAGE_KEY = "cup-predict:v1";
