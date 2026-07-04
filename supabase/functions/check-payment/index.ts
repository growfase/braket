// Checks whether a prediction's deposit wallet has received the stake amount.
// On first detection it marks the prediction 'paid' and credits the prize pool.
// Balance is read via raw JSON-RPC (full @solana/web3.js exceeds the edge
// function memory limit).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

const LAMPORTS_PER_SOL = 1_000_000_000;

// deno-lint-ignore no-explicit-any
async function rpcCall(rpc: string, method: string, params: any[]): Promise<any> {
  const r = await fetch(rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://cupbracket.xyz" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message ?? `${method} failed`);
  return j.result;
}

async function getBalanceLamports(rpc: string, address: string): Promise<number> {
  const res = await rpcCall(rpc, "getBalance", [address]);
  return res?.value ?? 0;
}

/** Best-effort: resolve the wallet that funded the deposit (the payout target). */
async function resolveSender(rpc: string, depositWallet: string): Promise<string | null> {
  try {
    const sigs = await rpcCall(rpc, "getSignaturesForAddress", [depositWallet, { limit: 10 }]);
    if (!Array.isArray(sigs) || sigs.length === 0) return null;
    // The first (oldest) signature is the funding transfer.
    const sig = sigs[sigs.length - 1]?.signature;
    if (!sig) return null;
    const tx = await rpcCall(rpc, "getTransaction", [
      sig,
      { maxSupportedTransactionVersion: 0, encoding: "jsonParsed" },
    ]);
    const keys = tx?.transaction?.message?.accountKeys ?? [];
    // deno-lint-ignore no-explicit-any
    const signer = keys.find((k: any) => k.signer);
    return signer?.pubkey ?? keys[0]?.pubkey ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { predictionId } = await req.json();
    if (typeof predictionId !== "string") return json({ error: "predictionId required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: pred, error } = await supabase
      .from("predictions")
      .select("id, deposit_wallet, amount_sol, payment_status, wallet")
      .eq("id", predictionId)
      .single();
    if (error || !pred) return json({ error: "not found" }, 404);
    if (pred.payment_status === "paid") {
      return json({ paid: true, balanceSol: null, wallet: pred.wallet ?? null });
    }

    const rpc = Deno.env.get("SOLANA_RPC_URL") ?? "https://api.devnet.solana.com";
    const lamports = await getBalanceLamports(rpc, pred.deposit_wallet);
    const balanceSol = lamports / LAMPORTS_PER_SOL;
    const needed = Number(pred.amount_sol);
    const paid = balanceSol + 1e-9 >= needed;
    let payoutWallet: string | null = pred.wallet ?? null;

    if (paid) {
      // Atomic flip: only the first caller that sets 'paid' credits the pool.
      const { data: flipped } = await supabase
        .from("predictions")
        .update({ payment_status: "paid" })
        .eq("id", predictionId)
        .eq("payment_status", "awaiting")
        .select("id");

      if (flipped && flipped.length > 0) {
        const { data: pool } = await supabase
          .from("pool")
          .select("prize_pool_sol")
          .eq("id", 1)
          .single();
        const next = Number(pool?.prize_pool_sol ?? 0) + needed;
        await supabase
          .from("pool")
          .update({ prize_pool_sol: next, updated_at: new Date().toISOString() })
          .eq("id", 1);

        // Capture the payout wallet from the deposit sender if not set at confirm.
        if (!pred.wallet) {
          const sender = await resolveSender(rpc, pred.deposit_wallet);
          if (sender) {
            await supabase
              .from("predictions")
              .update({ wallet: sender })
              .eq("id", predictionId)
              .is("wallet", null);
            payoutWallet = sender;
          }
        }

        // Fire an immediate sweep so the deposit consolidates to the pool wallet
        // right away (the 5-min cron is just a backstop). Runs in the background.
        const sweepKey = Deno.env.get("SWEEP_KEY");
        const url = Deno.env.get("SUPABASE_URL");
        const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (sweepKey && url && svc) {
          const p = fetch(`${url}/functions/v1/sweep`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${svc}`,
              apikey: svc,
              "x-sweep-key": sweepKey,
            },
            body: "{}",
          }).catch(() => {});
          // deno-lint-ignore no-explicit-any
          (globalThis as any).EdgeRuntime?.waitUntil?.(p);
        }
      }
    }

    return json({ paid, balanceSol, wallet: payoutWallet });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
