// Generates a unique deposit wallet (server-side) and saves the prediction
// as 'awaiting' payment. Returns the deposit address for the user to pay.
// Uses lightweight ed25519 + bs58 (full @solana/web3.js exceeds the edge
// function memory limit).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as ed from "https://esm.sh/@noble/ed25519@2";
import bs58 from "https://esm.sh/bs58@6";
import { corsHeaders, json } from "../_shared/cors.ts";
import { encryptSecret } from "../_shared/crypto.ts";

/** Canonical fingerprint of a picks map (sorted keys) so identical brackets match. */
async function hashPicks(picks: Record<string, string>): Promise<string> {
  const canon = Object.keys(picks)
    .sort()
    .map((k) => `${k}:${picks[k]}`)
    .join("|");
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canon));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { wallet, picks, championTeamId, stakeSol } = await req.json();
    if (
      !picks ||
      typeof championTeamId !== "string" ||
      typeof stakeSol !== "number" ||
      stakeSol < 0.1
    ) {
      return json({ error: "Invalid input." }, 400);
    }
    // The payer's wallet is optional here — if they don't connect one, it's
    // captured from the deposit transaction's sender in check-payment.
    const payoutWallet = typeof wallet === "string" && wallet.length > 0 ? wallet : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Solana keypair = ed25519. secretKey (64B) = seed(32B) || publicKey(32B).
    const seed = ed.utils.randomPrivateKey();
    const pub = await ed.getPublicKeyAsync(seed);
    const secretKey = new Uint8Array(64);
    secretKey.set(seed, 0);
    secretKey.set(pub, 32);
    const depositAddress = bs58.encode(pub);
    const secret = await encryptSecret(JSON.stringify(Array.from(secretKey)));
    const picksHash = await hashPicks(picks);

    const { data, error } = await supabase
      .from("predictions")
      .insert({
        wallet: payoutWallet,
        picks,
        picks_hash: picksHash,
        champion_team_id: championTeamId,
        stake_sol: stakeSol,
        amount_sol: stakeSol,
        deposit_wallet: depositAddress,
        payment_status: "awaiting",
        status: "pending",
      })
      .select("id")
      .single();
    if (error) return json({ error: error.message }, 500);

    const { error: sErr } = await supabase
      .from("deposit_secrets")
      .insert({ prediction_id: data.id, secret });
    if (sErr) return json({ error: sErr.message }, 500);

    return json({ predictionId: data.id, depositAddress, amountSol: stakeSol, bracketHash: picksHash });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
