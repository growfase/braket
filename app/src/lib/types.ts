export type Side = "left" | "right" | "center";
export type RoundId = "R32" | "R16" | "QF" | "SF" | "F";

export interface Team {
  id: string;
  name: string;
  /** 3-letter code shown on the cards. */
  code: string;
  /** ISO 3166 code for the flag image (e.g. "br", "gb-eng"). */
  iso: string;
  /** Emoji flag — optional fallback when the flag image can't load. */
  flag?: string;
}

/** One competitor slot in a match: either a seeded team or the winner of a feeder match. */
export interface MatchSlot {
  teamId?: string;
  from?: string;
}

export interface Match {
  id: string;
  round: RoundId;
  side: Side;
  a: MatchSlot;
  b: MatchSlot;
  /** Kickoff label for upcoming matches, e.g. "04/07 22:00". */
  kickoff?: string;
  /** True while the match is being played. */
  live?: boolean;
}

/** Map of matchId -> the team the user picked to win that match. */
export type BracketPicks = Record<string, string>;

export type PredictionStatus = "pending" | "won" | "lost";

/** A locked, submitted prediction (mock — no chain/DB yet). */
export interface Prediction {
  id: string;
  wallet: string;
  championId: string;
  championCode: string;
  championName: string;
  championFlag: string;
  picks?: BracketPicks;
  /** Canonical hash of the picks — identical brackets share the same value. */
  bracketHash?: string;
  stakeSol: number;
  createdAt: number;
  /** Server-generated deposit address for this prediction (payment target). */
  depositAddress?: string;
  paymentStatus?: "awaiting" | "paid" | "expired";
  status: PredictionStatus;
  /** How many picks matched official results (0 until results exist). */
  correctPicks: number;
  /** How many matches have official results to grade against. */
  gradedResults: number;
}
