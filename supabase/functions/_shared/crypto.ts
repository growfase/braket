// AES-256-GCM encryption for deposit-wallet secrets. The key lives ONLY in the
// SECRETS_ENC_KEY edge-function secret (base64 of 32 bytes) — never in the DB —
// so a leaked service_role key / DB dump cannot decrypt the deposit wallets.

async function getKey(): Promise<CryptoKey> {
  const b64 = Deno.env.get("SECRETS_ENC_KEY");
  if (!b64) throw new Error("SECRETS_ENC_KEY not set");
  const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  if (raw.length !== 32) throw new Error("SECRETS_ENC_KEY must be 32 bytes (base64)");
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

function toB64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

/** Returns "v1:" + base64(iv || ciphertext). */
export async function encryptSecret(plain: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plain)),
  );
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv, 0);
  out.set(ct, iv.length);
  return "v1:" + toB64(out);
}

/** Accepts "v1:"-prefixed ciphertext; falls back to returning legacy plaintext as-is. */
export async function decryptSecret(payload: string): Promise<string> {
  if (!payload.startsWith("v1:")) return payload; // legacy plaintext
  const key = await getKey();
  const raw = Uint8Array.from(atob(payload.slice(3)), (c) => c.charCodeAt(0));
  const iv = raw.slice(0, 12);
  const ct = raw.slice(12);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(pt);
}
