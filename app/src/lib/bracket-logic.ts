import type { BracketPicks, Match, MatchSlot } from "./types";
import { FINAL_MATCH_ID, MATCHES, RESULTS } from "./tournament-data";

/** Resolve which team currently occupies a slot (seeded team or feeder winner). */
export function resolveSlot(slot: MatchSlot, picks: BracketPicks): string | undefined {
  if (slot.teamId) return slot.teamId;
  if (slot.from) return picks[slot.from];
  return undefined;
}

/** The two team ids competing in a match given current picks (may be undefined). */
export function matchCompetitors(
  match: Match,
  picks: BracketPicks,
): { aId?: string; bId?: string } {
  return {
    aId: resolveSlot(match.a, picks),
    bId: resolveSlot(match.b, picks),
  };
}

/** A match is ready to pick once both competitors are known. */
export function isMatchReady(match: Match, picks: BracketPicks): boolean {
  const { aId, bId } = matchCompetitors(match, picks);
  return Boolean(aId && bId);
}

/**
 * Drop any pick that is no longer valid (its team no longer competes in that
 * match because an upstream pick changed). Iterates until stable.
 *
 * `base` is a resolution layer (e.g. official RESULTS) merged UNDER the picks so
 * competitors can be resolved from already-played rounds.
 */
export function prunePicks(
  picks: BracketPicks,
  matches: Match[] = MATCHES,
  base: BracketPicks = {},
): BracketPicks {
  const next: BracketPicks = { ...picks };
  for (let pass = 0; pass < matches.length; pass++) {
    let changed = false;
    for (const m of matches) {
      const pick = next[m.id];
      if (!pick) continue;
      const { aId, bId } = matchCompetitors(m, { ...base, ...next });
      if (pick !== aId && pick !== bId) {
        delete next[m.id];
        changed = true;
      }
    }
    if (!changed) break;
  }
  return next;
}

/** Set a match winner and cascade-invalidate any downstream picks that break. */
export function applyPick(
  picks: BracketPicks,
  matchId: string,
  teamId: string,
  matches: Match[] = MATCHES,
  base: BracketPicks = {},
): BracketPicks {
  return prunePicks({ ...picks, [matchId]: teamId }, matches, base);
}

/** The predicted champion's team id (winner of the final), if chosen. */
export function getChampionId(picks: BracketPicks): string | undefined {
  return picks[FINAL_MATCH_ID];
}

/** A match is locked (already played) — its winner comes from official RESULTS. */
export function isMatchLocked(matchId: string): boolean {
  return Boolean(RESULTS[matchId]);
}

/** Matches the player must predict (everything not already played). */
export function unplayedMatches(): Match[] {
  return MATCHES.filter((m) => !RESULTS[m.id]);
}

/** How many of the to-predict matches the player has filled. */
export function predictedCount(picks: BracketPicks): number {
  return unplayedMatches().reduce((n, m) => (picks[m.id] ? n + 1 : n), 0);
}

/** How many matches the player still needs to predict. */
export function totalToPredict(): number {
  return unplayedMatches().length;
}

/** True once every to-predict match has a pick (whole bracket filled). */
export function isBracketComplete(picks: BracketPicks): boolean {
  return unplayedMatches().every((m) => Boolean(picks[m.id]));
}

/**
 * Score a submitted bracket: 1 point per correct match winner. Only matches that
 * have an official result AND were predicted by the player are graded.
 */
export function scoreBracket(picks: BracketPicks): { correct: number; graded: number } {
  let correct = 0;
  let graded = 0;
  for (const m of MATCHES) {
    const real = RESULTS[m.id];
    if (!real || picks[m.id] === undefined) continue;
    graded += 1;
    if (picks[m.id] === real) correct += 1;
  }
  return { correct, graded };
}

/** Teams knocked out — the loser of every played (resolved) match. */
export function getEliminatedTeams(): Set<string> {
  const eliminated = new Set<string>();
  for (const m of MATCHES) {
    const winner = RESULTS[m.id];
    if (!winner) continue;
    const { aId, bId } = matchCompetitors(m, RESULTS);
    if (aId && aId !== winner) eliminated.add(aId);
    if (bId && bId !== winner) eliminated.add(bId);
  }
  return eliminated;
}

/** A team is a valid champion pick while it hasn't been eliminated. */
export function isTeamAlive(teamId: string, eliminated?: Set<string>): boolean {
  return !(eliminated ?? getEliminatedTeams()).has(teamId);
}

/** Grade a set of picks against official results. */
export function gradePrediction(
  picks: BracketPicks,
  results: BracketPicks,
): { correct: number; total: number } {
  const gradedIds = Object.keys(results);
  let correct = 0;
  for (const id of gradedIds) {
    if (picks[id] && picks[id] === results[id]) correct += 1;
  }
  return { correct, total: gradedIds.length };
}
