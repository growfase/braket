import { supabase } from "./supabase";
import type { BracketPicks } from "./types";

/** A match row as stored in Supabase (see supabase/migrations/0001_...sql). */
export interface DbMatch {
  id: string;
  round: "R32" | "R16" | "QF" | "SF" | "F" | "3P";
  side: "left" | "right" | "center";
  team_a: string | null;
  team_b: string | null;
  feed_a: string | null;
  feed_b: string | null;
  winner: string | null;
  score_a: string | null;
  score_b: string | null;
  kickoff: string | null;
  status: "scheduled" | "live" | "finished";
  sort: number;
}

/** Live prize pool (SOL) from the `pool` row, or null if unavailable. */
export async function fetchPoolSol(): Promise<number | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("pool").select("prize_pool_sol").eq("id", 1).maybeSingle();
  if (error || !data) return null;
  return Number(data.prize_pool_sol);
}

/** All matches (bracket structure + results), ordered for rendering. */
export async function fetchMatches(): Promise<DbMatch[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("round")
    .order("side")
    .order("sort");
  if (error) return null;
  return data as DbMatch[];
}

export interface CreatePredictionResult {
  ok: boolean;
  error?: string;
  predictionId?: string;
  depositAddress?: string;
  amountSol?: number;
  /** Canonical hash of the picks — identical brackets share it. */
  bracketHash?: string;
}

/**
 * Create a prediction via the `create-prediction` edge function. The server
 * generates a unique deposit wallet and saves the prediction as 'awaiting'.
 */
export async function createPrediction(p: {
  wallet?: string;
  picks: BracketPicks;
  championTeamId: string;
  stakeSol: number;
}): Promise<CreatePredictionResult> {
  if (!supabase) return { ok: false, error: "Supabase not configured" };
  try {
    // DB matches use M-prefixed ids; the app uses J-prefix — remap on write.
    const picks = Object.fromEntries(
      Object.entries(p.picks).map(([k, v]) => [k.replace(/^J/, "M"), v]),
    );
    const { data, error } = await supabase.functions.invoke("create-prediction", {
      body: { wallet: p.wallet ?? null, picks, championTeamId: p.championTeamId, stakeSol: p.stakeSol },
    });
    if (error) return { ok: false, error: error.message };
    if (data?.error) return { ok: false, error: data.error };
    return {
      ok: true,
      predictionId: data.predictionId,
      depositAddress: data.depositAddress,
      amountSol: data.amountSol,
      bracketHash: data.bracketHash,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "create failed" };
  }
}

/**
 * Aggregate stats for one bracket fingerprint: how many PAID players share this
 * exact bracket and the total SOL they staked. Used in "My Bracket" to show the
 * stake-weighted split among identical winning brackets.
 */
export async function fetchBracketGroup(
  hash: string,
): Promise<{ count: number; totalStake: number } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("predictions")
    .select("stake_sol")
    .eq("picks_hash", hash)
    .eq("payment_status", "paid");
  if (error || !data) return null;
  const totalStake = data.reduce((s, r) => s + Number(r.stake_sol ?? 0), 0);
  return { count: data.length, totalStake };
}

/** Ask the server to check the deposit wallet and mark the prediction paid. */
export async function checkPayment(
  predictionId: string,
): Promise<{ paid: boolean; balanceSol: number | null; wallet?: string | null; error?: string }> {
  if (!supabase) return { paid: false, balanceSol: null, error: "Supabase not configured" };
  try {
    const { data, error } = await supabase.functions.invoke("check-payment", {
      body: { predictionId },
    });
    if (error) return { paid: false, balanceSol: null, error: error.message };
    if (data?.error) return { paid: false, balanceSol: null, error: data.error };
    return { paid: Boolean(data.paid), balanceSol: data.balanceSol ?? null, wallet: data.wallet ?? null };
  } catch (e) {
    return { paid: false, balanceSol: null, error: e instanceof Error ? e.message : "check failed" };
  }
}
