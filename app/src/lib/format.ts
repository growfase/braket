/** Format a SOL amount, trimming trailing zeros (e.g. 0.1 SOL, 1.25 SOL). */
export function fmtSol(n: number, maxDp = 3): string {
  const rounded = Number(n.toFixed(maxDp));
  return `${rounded} SOL`;
}

/** Shorten a base58 wallet address: 7Xk3…9dQ2. */
export function shortAddr(addr: string): string {
  return addr.length > 8 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr;
}

/** Human countdown like "2D 14H" (falls back to "0H" when elapsed). */
export function fmtCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return "Closed";
  const totalMinutes = Math.floor(msRemaining / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  if (days > 0) return `${days}D ${hours}H`;
  const minutes = totalMinutes % 60;
  return `${hours}H ${minutes}M`;
}

/** Short date like "Jul 4, 2026". */
export function fmtDate(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Just now" / "3m ago" / "2h ago" / date. */
export function fmtRelative(epochMs: number): string {
  const diff = Date.now() - epochMs;
  if (diff < 60_000) return "Just now";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
