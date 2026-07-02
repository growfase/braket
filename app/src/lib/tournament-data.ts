import type { BracketPicks, Match, RoundId, Side, Team } from "./types";
import type { DbMatch } from "./supabase-data";

/**
 * 32-team knockout tournament (Round of 32 → R16 → QF → SF → Final = 31 matches),
 * mirroring the official bracket. Results/scores below reflect matches already
 * played; the rest are pending. Later this is fed by the backend/oracle.
 */
export const TEAMS: Team[] = [
  // Left half
  { id: "ger", name: "Germany", code: "GER", iso: "de" },
  { id: "par", name: "Paraguay", code: "PAR", iso: "py" },
  { id: "fra", name: "France", code: "FRA", iso: "fr" },
  { id: "swe", name: "Sweden", code: "SWE", iso: "se" },
  { id: "rsa", name: "South Africa", code: "RSA", iso: "za" },
  { id: "can", name: "Canada", code: "CAN", iso: "ca" },
  { id: "ned", name: "Netherlands", code: "NED", iso: "nl" },
  { id: "mar", name: "Morocco", code: "MAR", iso: "ma" },
  { id: "por", name: "Portugal", code: "POR", iso: "pt" },
  { id: "cro", name: "Croatia", code: "CRO", iso: "hr" },
  { id: "esp", name: "Spain", code: "ESP", iso: "es" },
  { id: "aut", name: "Austria", code: "AUT", iso: "at" },
  { id: "usa", name: "USA", code: "USA", iso: "us" },
  { id: "bih", name: "Bosnia & Herz.", code: "BIH", iso: "ba" },
  { id: "bel", name: "Belgium", code: "BEL", iso: "be" },
  { id: "sen", name: "Senegal", code: "SEN", iso: "sn" },
  // Right half
  { id: "bra", name: "Brazil", code: "BRA", iso: "br" },
  { id: "jpn", name: "Japan", code: "JPN", iso: "jp" },
  { id: "civ", name: "Ivory Coast", code: "CIV", iso: "ci" },
  { id: "nor", name: "Norway", code: "NOR", iso: "no" },
  { id: "mex", name: "Mexico", code: "MEX", iso: "mx" },
  { id: "ecu", name: "Ecuador", code: "ECU", iso: "ec" },
  { id: "eng", name: "England", code: "ENG", iso: "gb-eng" },
  { id: "cod", name: "DR Congo", code: "COD", iso: "cd" },
  { id: "arg", name: "Argentina", code: "ARG", iso: "ar" },
  { id: "cpv", name: "Cape Verde", code: "CPV", iso: "cv" },
  { id: "aus", name: "Australia", code: "AUS", iso: "au" },
  { id: "egy", name: "Egypt", code: "EGY", iso: "eg" },
  { id: "sui", name: "Switzerland", code: "SUI", iso: "ch" },
  { id: "alg", name: "Algeria", code: "ALG", iso: "dz" },
  { id: "col", name: "Colombia", code: "COL", iso: "co" },
  { id: "gha", name: "Ghana", code: "GHA", iso: "gh" },
];

export const TEAM_BY_ID: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t]),
);

export const ROUND_LABELS: Record<RoundId, string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter Final",
  SF: "Semi Final",
  F: "Final",
};

export const MATCHES: Match[] = [
  // ---------- Left half ----------
  // Round of 32
  { id: "J74", round: "R32", side: "left", a: { teamId: "ger" }, b: { teamId: "par" } },
  { id: "J77", round: "R32", side: "left", a: { teamId: "fra" }, b: { teamId: "swe" } },
  { id: "J73", round: "R32", side: "left", a: { teamId: "rsa" }, b: { teamId: "can" } },
  { id: "J75", round: "R32", side: "left", a: { teamId: "ned" }, b: { teamId: "mar" } },
  { id: "J83", round: "R32", side: "left", a: { teamId: "por" }, b: { teamId: "cro" }, kickoff: "03/07 00:00" },
  { id: "J84", round: "R32", side: "left", a: { teamId: "esp" }, b: { teamId: "aut" }, kickoff: "02/07 20:00" },
  { id: "J81", round: "R32", side: "left", a: { teamId: "usa" }, b: { teamId: "bih" }, kickoff: "02/07 01:00" },
  { id: "J82", round: "R32", side: "left", a: { teamId: "bel" }, b: { teamId: "sen" }, kickoff: "01/07 21:00" },
  // Round of 16
  { id: "J89", round: "R16", side: "left", a: { from: "J74" }, b: { from: "J77" }, kickoff: "04/07 22:00" },
  { id: "J90", round: "R16", side: "left", a: { from: "J73" }, b: { from: "J75" }, kickoff: "04/07 18:00" },
  { id: "J93", round: "R16", side: "left", a: { from: "J83" }, b: { from: "J84" } },
  { id: "J94", round: "R16", side: "left", a: { from: "J81" }, b: { from: "J82" } },
  // Quarter finals
  { id: "J97", round: "QF", side: "left", a: { from: "J89" }, b: { from: "J90" } },
  { id: "J98", round: "QF", side: "left", a: { from: "J93" }, b: { from: "J94" } },
  // Semi final
  { id: "J101", round: "SF", side: "left", a: { from: "J97" }, b: { from: "J98" } },

  // ---------- Right half ----------
  // Round of 32
  { id: "J76", round: "R32", side: "right", a: { teamId: "bra" }, b: { teamId: "jpn" } },
  { id: "J78", round: "R32", side: "right", a: { teamId: "civ" }, b: { teamId: "nor" } },
  { id: "J79", round: "R32", side: "right", a: { teamId: "mex" }, b: { teamId: "ecu" } },
  { id: "J80", round: "R32", side: "right", a: { teamId: "eng" }, b: { teamId: "cod" }, live: true },
  { id: "J86", round: "R32", side: "right", a: { teamId: "arg" }, b: { teamId: "cpv" }, kickoff: "03/07 23:00" },
  { id: "J88", round: "R32", side: "right", a: { teamId: "aus" }, b: { teamId: "egy" }, kickoff: "03/07 19:00" },
  { id: "J85", round: "R32", side: "right", a: { teamId: "sui" }, b: { teamId: "alg" }, kickoff: "03/07 04:00" },
  { id: "J87", round: "R32", side: "right", a: { teamId: "col" }, b: { teamId: "gha" }, kickoff: "04/07 02:30" },
  // Round of 16
  { id: "J91", round: "R16", side: "right", a: { from: "J76" }, b: { from: "J78" }, kickoff: "05/07 21:00" },
  { id: "J92", round: "R16", side: "right", a: { from: "J79" }, b: { from: "J80" }, kickoff: "06/07 01:00" },
  { id: "J95", round: "R16", side: "right", a: { from: "J86" }, b: { from: "J88" }, kickoff: "07/07 17:00" },
  { id: "J96", round: "R16", side: "right", a: { from: "J85" }, b: { from: "J87" }, kickoff: "07/07 21:00" },
  // Quarter finals
  { id: "J99", round: "QF", side: "right", a: { from: "J91" }, b: { from: "J92" } },
  { id: "J100", round: "QF", side: "right", a: { from: "J95" }, b: { from: "J96" } },
  // Semi final
  { id: "J102", round: "SF", side: "right", a: { from: "J99" }, b: { from: "J100" } },

  // ---------- Final ----------
  { id: "J104", round: "F", side: "center", a: { from: "J101" }, b: { from: "J102" } },
];

export const MATCH_BY_ID: Record<string, Match> = Object.fromEntries(
  MATCHES.map((m) => [m.id, m]),
);

export const FINAL_MATCH_ID = "J104";

/** Which team advanced (official results). Only played matches appear here. */
export const RESULTS: BracketPicks = {
  J74: "par", // GER 1 (3) — PAR 1 (4) pens
  J77: "fra", // FRA 3 — SWE 0
  J73: "can", // RSA 0 — CAN 1
  J75: "mar", // NED 1 (2) — MAR 1 (3) pens
  J76: "bra", // BRA 2 — JPN 1
  J78: "nor", // CIV 1 — NOR 2
  J79: "mex", // MEX 2 — ECU 0
  // J80 (ENG–COD) still in progress; the rest are not played yet.
};

/** Per-match display scores, keyed by matchId → { a, b } (pens in parentheses). */
export const SCORES: Record<string, { a: string; b: string }> = {
  J74: { a: "1 (3)", b: "1 (4)" },
  J77: { a: "3", b: "0" },
  J73: { a: "0", b: "1" },
  J75: { a: "1 (2)", b: "1 (3)" },
  J76: { a: "2", b: "1" },
  J78: { a: "1", b: "2" },
  J79: { a: "2", b: "0" },
  J80: { a: "0", b: "1" }, // live (halftime)
};

const ROUND_RANK: Record<string, number> = { R32: 0, R16: 1, QF: 2, SF: 3, F: 4 };

function fmtKickoff(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

/**
 * Hydrate the in-memory bracket from Supabase `matches` rows. The DB uses M-prefixed
 * ids (M74…M104); we remap them to the frontend's J-prefix so nothing else changes.
 * Mutates MATCHES/MATCH_BY_ID/RESULTS/SCORES in place (kept as live references).
 * The 3rd-place match (round '3P') is skipped — it isn't part of the prediction.
 */
export function applyDbMatches(rows: DbMatch[]): void {
  const toJ = (id: string | null) => (id ? id.replace(/^M/, "J") : undefined);
  const used = rows
    .filter((r) => r.round !== "3P")
    .sort((a, b) => (ROUND_RANK[a.round] - ROUND_RANK[b.round]) || a.sort - b.sort);

  const next: Match[] = used.map((r) => ({
    id: toJ(r.id)!,
    round: r.round as RoundId,
    side: r.side as Side,
    a: r.team_a ? { teamId: r.team_a } : { from: toJ(r.feed_a) },
    b: r.team_b ? { teamId: r.team_b } : { from: toJ(r.feed_b) },
    kickoff: r.kickoff ? fmtKickoff(r.kickoff) : undefined,
    live: r.status === "live",
  }));

  MATCHES.length = 0;
  MATCHES.push(...next);
  for (const k of Object.keys(MATCH_BY_ID)) delete MATCH_BY_ID[k];
  for (const m of next) MATCH_BY_ID[m.id] = m;
  for (const k of Object.keys(RESULTS)) delete RESULTS[k];
  for (const r of used) if (r.winner) RESULTS[toJ(r.id)!] = r.winner;
  for (const k of Object.keys(SCORES)) delete SCORES[k];
  for (const r of used)
    if (r.score_a != null || r.score_b != null)
      SCORES[toJ(r.id)!] = { a: r.score_a ?? "", b: r.score_b ?? "" };
}
