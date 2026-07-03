// Reconciles 'awaiting' predictions server-side: for each, checks its deposit
// wallet balance and — if funded — marks it paid, credits the prize pool, and
// captures the payer wallet. Runs on a cron so a payment is never missed even
// if the user closed the tab before the modal detected it.
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

async function resolveSender(rpc: string, depositWallet: string): Promise<string | null> {
  try {
    const sigs = await rpcCall(rpc, "getSignaturesForAddress", [depositWallet, { limit: 10 }]);
    if (!Array.isArray(sigs) || sigs.length === 0) return null;
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
    // Admin guard: if RECONCILE_KEY is set, require it (used by the cron).
    const reconcileKey = Deno.env.get("RECONCILE_KEY");
    if (reconcileKey && req.headers.get("x-reconcile-key") !== reconcileKey) {
      return json({ error: "unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const rpc = Deno.env.get("SOLANA_RPC_URL") ?? "https://api.mainnet-beta.solana.com";

    const { data: preds, error } = await supabase
      .from("predictions")
      .select("id, deposit_wallet, amount_sol, wallet")
      .eq("payment_status", "awaiting")
      .limit(100);
    if (error) return json({ error: error.message }, 500);

    const credited: string[] = [];
    for (const p of preds ?? []) {
      try {
        const res = await rpcCall(rpc, "getBalance", [p.deposit_wallet]);
        const balanceSol = (res?.value ?? 0) / LAMPORTS_PER_SOL;
        const needed = Number(p.amount_sol);
        if (balanceSol + 1e-9 < needed) continue;

        const { data: flipped } = await supabase
          .from("predictions")
          .update({ payment_status: "paid" })
          .eq("id", p.id)
          .eq("payment_status", "awaiting")
          .select("id");
        if (!flipped || flipped.length === 0) continue;

        const { data: pool } = await supabase
          .from("pool")
          .select("prize_pool_sol")
          .eq("id", 1)
          .single();
        await supabase
          .from("pool")
          .update({
            prize_pool_sol: Number(pool?.prize_pool_sol ?? 0) + needed,
            updated_at: new Date().toISOString(),
          })
          .eq("id", 1);

        if (!p.wallet) {
          const sender = await resolveSender(rpc, p.deposit_wallet);
          if (sender) {
            await supabase
              .from("predictions")
              .update({ wallet: sender })
              .eq("id", p.id)
              .is("wallet", null);
          }
        }
        credited.push(p.id);
      } catch {
        // skip this one; try again on the next run
      }
    }

    return json({ checked: preds?.length ?? 0, credited });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
