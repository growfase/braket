import type { Match, RoundId } from "@/lib/types";
import { MATCHES, ROUND_LABELS } from "@/lib/tournament-data";
import { MatchCard, type BracketMode } from "./match-card";

/** Column order per half: left runs outer→center, right runs center→outer. */
const LEFT_ROUNDS: RoundId[] = ["R32", "R16", "QF", "SF"];
const RIGHT_ROUNDS: RoundId[] = ["SF", "QF", "R16", "R32"];

function matchesFor(side: "left" | "right", round: RoundId): Match[] {
  return MATCHES.filter((m) => m.side === side && m.round === round);
}

function RoundColumn({
  side,
  round,
  mode,
}: {
  side: "left" | "right";
  round: RoundId;
  mode: BracketMode;
}) {
  const matches = matchesFor(side, round);
  return (
    <div className="flex flex-col">
      <div className="mb-2 whitespace-nowrap text-center text-[11px] font-semibold uppercase tracking-wider text-muted">
        {ROUND_LABELS[round]}
      </div>
      <div className="flex flex-1 flex-col justify-around gap-3">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} mode={mode} />
        ))}
      </div>
    </div>
  );
}

export function BracketSide({ side, mode }: { side: "left" | "right"; mode: BracketMode }) {
  const rounds = side === "left" ? LEFT_ROUNDS : RIGHT_ROUNDS;
  return (
    <div className="flex items-stretch gap-2 sm:gap-3">
      {rounds.map((round) => (
        <RoundColumn key={`${side}-${round}`} side={side} round={round} mode={mode} />
      ))}
    </div>
  );
}
