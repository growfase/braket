import { describe, expect, it } from "vitest";
import {
  applyPick,
  getChampionId,
  isBracketComplete,
  isMatchLocked,
  matchCompetitors,
  predictedCount,
  scoreBracket,
  totalToPredict,
} from "./bracket-logic";
import { FINAL_MATCH_ID, MATCH_BY_ID, MATCHES, RESULTS } from "./tournament-data";
import type { BracketPicks } from "./types";

/** Greedily fill every to-predict match (always advance the "a" side). */
function fillAll(): BracketPicks {
  let picks: BracketPicks = {};
  for (const m of MATCHES) {
    if (RESULTS[m.id]) continue; // played → locked
    const { aId } = matchCompetitors(m, { ...RESULTS, ...picks });
    if (aId) picks = applyPick(picks, m.id, aId, MATCHES, RESULTS);
  }
  return picks;
}

describe("locked matches", () => {
  it("marks played matches as locked and unplayed as open", () => {
    expect(isMatchLocked("J74")).toBe(true); // played (PAR won)
    expect(isMatchLocked("J89")).toBe(false); // R16, not played
  });
});

describe("matchCompetitors", () => {
  it("resolves feeders from official results (base layer)", () => {
    const { aId, bId } = matchCompetitors(MATCH_BY_ID["J89"], RESULTS);
    expect(aId).toBe("par"); // winner of J74
    expect(bId).toBe("fra"); // winner of J77
  });

  it("returns undefined competitors when feeders aren't decided", () => {
    const { aId, bId } = matchCompetitors(MATCH_BY_ID["J97"], RESULTS);
    expect(aId).toBeUndefined();
    expect(bId).toBeUndefined();
  });
});

describe("applyPick + prune", () => {
  it("records a pick", () => {
    const picks = applyPick({}, "J83", "por", MATCHES, RESULTS);
    expect(picks["J83"]).toBe("por");
  });

  it("invalidates a downstream pick when an upstream winner changes", () => {
    let picks = applyPick({}, "J83", "por", MATCHES, RESULTS); // POR/CRO → POR
    picks = applyPick(picks, "J84", "esp", MATCHES, RESULTS); // ESP/AUT → ESP
    picks = applyPick(picks, "J93", "por", MATCHES, RESULTS); // J93 = W83 vs W84 → POR
    expect(picks["J93"]).toBe("por");
    // Change J83 to CRO — POR no longer competes in J93, so that pick must drop.
    picks = applyPick(picks, "J83", "cro", MATCHES, RESULTS);
    expect(picks["J83"]).toBe("cro");
    expect(picks["J93"]).toBeUndefined();
  });
});

describe("bracket completion", () => {
  it("needs every unplayed match predicted", () => {
    expect(totalToPredict()).toBe(MATCHES.length - Object.keys(RESULTS).length);
    expect(isBracketComplete({})).toBe(false);

    const full = fillAll();
    expect(predictedCount(full)).toBe(totalToPredict());
    expect(isBracketComplete(full)).toBe(true);
    expect(getChampionId(full)).toBe(full[FINAL_MATCH_ID]);
    expect(getChampionId(full)).toBeDefined();
  });
});

describe("scoreBracket", () => {
  it("counts 1 point per correct match that has an official result", () => {
    // J74's real result is PAR.
    expect(scoreBracket({ J74: "par" })).toEqual({ correct: 1, graded: 1 });
    expect(scoreBracket({ J74: "ger" })).toEqual({ correct: 0, graded: 1 });
    // Predicting only future matches → nothing graded yet.
    expect(scoreBracket({ J89: "par" })).toEqual({ correct: 0, graded: 0 });
  });
});
