// Sweeps paid deposits from their per-prediction wallets into the pool wallet.
// Builds/serializes a legacy Solana transfer manually (full @solana/web3.js
// exceeds the edge function memory limit) and signs it with @noble/ed25519.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as ed from "https://esm.sh/@noble/ed25519@2";
import bs58 from "https://esm.sh/bs58@6";
import { corsHeaders, json } from "../_shared/cors.ts";
import { decryptSecret } from "../_shared/crypto.ts";

const FEE_LAMPORTS = 5000n; // 1 signature
const SYSTEM_PROGRAM = new Uint8Array(32); // "111...1" = 32 zero bytes

// deno-lint-ignore no-explicit-any
async function rpcCall(url: string, method: string, params: any[]): Promise<any> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message ?? `${method} failed`);
  return j.result;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const len = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** compact-u16 (shortvec) length prefix. */
function shortvec(len: number): Uint8Array {
  const out: number[] = [];
  let rem = len;
  for (;;) {
    let elem = rem & 0x7f;
    rem >>= 7;
    if (rem === 0) {
      out.push(elem);
      break;
    }
    out.push(elem | 0x80);
  }
  return Uint8Array.from(out);
}

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

/** Serialize a legacy single-transfer message. */
function buildMessage(
  from: Uint8Array,
  to: Uint8Array,
  lamports: bigint,
  blockhash: Uint8Array,
): Uint8Array {
  const data = new Uint8Array(12);
  const dv = new DataView(data.buffer);
  dv.setUint32(0, 2, true); // SystemProgram Transfer = 2
  dv.setBigUint64(4, lamports, true);
  return concat([
    Uint8Array.from([1, 0, 1]), // header: 1 signer, 0 ro-signed, 1 ro-unsigned
    shortvec(3),
    from, // index 0 — writable signer
    to, // index 1 — writable
    SYSTEM_PROGRAM, // index 2 — readonly
    blockhash,
    shortvec(1), // 1 instruction
    Uint8Array.from([2]), // programIdIndex = system
    shortvec(2),
    Uint8Array.from([0, 1]), // accounts: from, to
    shortvec(12),
    data,
  ]);
}

async function sweepOne(
  rpc: string,
  poolPub: Uint8Array,
  depositWallet: string,
  secret: number[],
): Promise<{ sig: string; lamports: number } | { skip: string }> {
  const lamports = BigInt(await rpcCall(rpc, "getBalance", [depositWallet]).then((r) => r.value ?? 0));
  if (lamports <= FEE_LAMPORTS) return { skip: `balance ${lamports} <= fee` };
  const amount = lamports - FEE_LAMPORTS;

  const secretKey = Uint8Array.from(secret);
  const seed = secretKey.slice(0, 32);
  const from = bs58.decode(depositWallet);

  const { blockhash } = await rpcCall(rpc, "getLatestBlockhash", [{ commitment: "confirmed" }]).then(
    (r) => r.value,
  );
  const msg = buildMessage(from, poolPub, amount, bs58.decode(blockhash));
  const sig = await ed.signAsync(msg, seed);
  const tx = concat([shortvec(1), sig, msg]);

  const txSig: string = await rpcCall(rpc, "sendTransaction", [
    toBase64(tx),
    { encoding: "base64", preflightCommitment: "confirmed" },
  ]);
  return { sig: txSig, lamports: Number(amount) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // Optional admin guard: if SWEEP_KEY is set, require it (used by cron/prod).
    const sweepKey = Deno.env.get("SWEEP_KEY");
    if (sweepKey && req.headers.get("x-sweep-key") !== sweepKey) {
      return json({ error: "unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const onlyId: string | undefined = body?.predictionId;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: pool } = await supabase.from("pool").select("pool_wallet").eq("id", 1).single();
    if (!pool?.pool_wallet) return json({ error: "pool wallet not set" }, 500);
    const poolPub = bs58.decode(pool.pool_wallet);
    const rpc = Deno.env.get("SOLANA_RPC_URL") ?? "https://api.devnet.solana.com";

    // Eligible: paid, not yet swept.
    let q = supabase
      .from("predictions")
      .select("id, deposit_wallet")
      .eq("payment_status", "paid")
      .is("swept_at", null);
    if (onlyId) q = q.eq("id", onlyId);
    const { data: preds, error } = await q;
    if (error) return json({ error: error.message }, 500);

    const results: unknown[] = [];
    for (const p of preds ?? []) {
      try {
        const { data: sec } = await supabase
          .from("deposit_secrets")
          .select("secret")
          .eq("prediction_id", p.id)
          .single();
        if (!sec?.secret) {
          results.push({ id: p.id, skip: "no secret" });
          continue;
        }
        const decrypted = await decryptSecret(sec.secret);
        const out = await sweepOne(rpc, poolPub, p.deposit_wallet, JSON.parse(decrypted));
        if ("skip" in out) {
          results.push({ id: p.id, skip: out.skip });
          continue;
        }
        await supabase
          .from("predictions")
          .update({ swept_at: new Date().toISOString(), sweep_sig: out.sig })
          .eq("id", p.id);
        results.push({ id: p.id, sweptLamports: out.lamports, sig: out.sig });
      } catch (e) {
        results.push({ id: p.id, error: e instanceof Error ? e.message : String(e) });
      }
    }

    return json({ pool: pool.pool_wallet, count: results.length, results });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
