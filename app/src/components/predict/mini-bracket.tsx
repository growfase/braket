import { useRef } from "react";
import { Check, Trophy } from "lucide-react";
import type { BracketPicks, RoundId } from "@/lib/types";
import { FINAL_MATCH_ID, MATCHES, RESULTS, TEAM_BY_ID } from "@/lib/tournament-data";
import { usePredictions } from "@/lib/prediction-store";
import { Flag } from "@/components/ui/flag";
import { BracketConnectors } from "@/components/bracket/bracket-connectors";

const LEFT: RoundId[] = ["R32", "R16", "QF", "SF"];
const RIGHT: RoundId[] = ["SF", "QF", "R16", "R32"];

function MiniMatch({ id, winnerId }: { id: string; winnerId?: string }) {
  const team = winnerId ? TEAM_BY_ID[winnerId] : undefined;
  return (
    <div
      data-mid={id}
      className="flex items-center gap-1 rounded border border-border bg-panel/80 px-1 py-[3px]"
    >
      {team ? (
        <Flag iso={team.iso} code={team.code} size={10} />
      ) : (
        <span className="inline-block h-[10px] w-[14px] rounded-[2px] bg-border/60" />
      )}
      <span className="grid h-3 w-3 shrink-0 place-items-center rounded-full bg-cyan text-[#03121a]">
        <Check size={7} strokeWidth={4} />
      </span>
    </div>
  );
}

function MiniSide({ side, effective }: { side: "left" | "right"; effective: BracketPicks }) {
  const rounds = side === "left" ? LEFT : RIGHT;
  return (
    <div className="relative z-10 flex items-stretch gap-1.5">
      {rounds.map((r) => (
        <div key={r} className="flex flex-col justify-around gap-1">
          {MATCHES.filter((m) => m.side === side && m.round === r).map((m) => (
            <MiniMatch key={m.id} id={m.id} winnerId={effective[m.id]} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Compact read-only view of the whole picked bracket (miniature flags + connectors). */
export function MiniBracket() {
  const { picks } = usePredictions();
  const effective = { ...RESULTS, ...picks };
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="overflow-x-auto">
      <div ref={ref} className="relative flex w-max items-stretch justify-center gap-2">
        <BracketConnectors containerRef={ref} strokeWidth={1} />
        <MiniSide side="left" effective={effective} />
        <div className="relative z-10 flex shrink-0 items-center">
          <span
            data-mid={FINAL_MATCH_ID}
            className="grid h-8 w-9 place-items-center rounded-md border border-gold/50 bg-gold/10"
          >
            <Trophy size={16} className="text-gold" />
          </span>
        </div>
        <MiniSide side="right" effective={effective} />
      </div>
    </div>
  );
}
