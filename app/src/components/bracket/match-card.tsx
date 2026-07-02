import { Check } from "lucide-react";
import type { Match } from "@/lib/types";
import { isMatchLocked, matchCompetitors } from "@/lib/bracket-logic";
import { RESULTS, SCORES, TEAM_BY_ID } from "@/lib/tournament-data";
import { usePredictions } from "@/lib/prediction-store";
import { Flag } from "@/components/ui/flag";
import { cn } from "@/lib/utils";

export type BracketMode = "picks" | "results";

function TeamRow({
  teamId,
  score,
  won,
  isLoser,
  clickable,
  onPick,
}: {
  teamId?: string;
  score?: string;
  /** This team advanced/was picked → gold highlight + glow on this row only. */
  won: boolean;
  isLoser: boolean;
  clickable: boolean;
  onPick: () => void;
}) {
  const team = teamId ? TEAM_BY_ID[teamId] : undefined;
  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={onPick}
      className={cn(
        "flex w-full items-center gap-1.5 px-2 py-1.5 text-left transition-colors",
        clickable && "cursor-pointer hover:bg-panel-2",
        isLoser && "opacity-40",
        won && "bg-gold/15 shadow-[inset_0_0_16px_-4px_rgba(247,200,67,0.65)]",
      )}
    >
      {team ? (
        <Flag iso={team.iso} code={team.code} size={13} />
      ) : (
        <span className="inline-block h-[13px] w-[18px] rounded-[2px] bg-border/60" />
      )}
      <span
        className={cn(
          "flex-1 truncate text-xs font-bold tracking-wide",
          won ? "text-gold drop-shadow-[0_0_6px_rgba(247,200,67,0.65)]" : "text-fg",
        )}
      >
        {team?.code ?? "TBD"}
      </span>
      {score != null && <span className="text-[11px] font-semibold text-muted">{score}</span>}
      <span
        className={cn(
          "grid h-4 w-4 shrink-0 place-items-center rounded-full border",
          won
            ? "border-gold bg-gold text-[#1c1300] shadow-[0_0_8px_rgba(247,200,67,0.75)]"
            : "border-border text-transparent",
        )}
      >
        <Check size={9} strokeWidth={3} />
      </span>
    </button>
  );
}

export function MatchCard({
  match,
  mode,
  className,
}: {
  match: Match;
  mode: BracketMode;
  className?: string;
}) {
  const { picks, pick, locked: submitted } = usePredictions();

  const effective = mode === "results" ? RESULTS : { ...RESULTS, ...picks };
  const { aId, bId } = matchCompetitors(match, effective);
  const matchLocked = isMatchLocked(match.id);
  const winner = effective[match.id];
  const score = SCORES[match.id];

  const editable = mode === "picks" && !submitted && !matchLocked;
  const ready = Boolean(aId && bId);

  const rowFor = (teamId?: string, s?: string) => ({
    teamId,
    score: s,
    won: !!winner && teamId === winner,
    isLoser: !!winner && !!teamId && winner !== teamId,
    clickable: editable && ready && !!teamId,
    onPick: () => teamId && pick(match.id, teamId),
  });

  // Small footer: LIVE while playing, else the kickoff time for upcoming matches.
  const footer = match.live ? (
    <div className="flex items-center justify-center gap-1 border-t border-border/70 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red" /> Live
    </div>
  ) : !winner && match.kickoff ? (
    <div className="border-t border-border/70 py-0.5 text-center text-[9px] font-medium text-muted">
      {match.kickoff}
    </div>
  ) : null;

  return (
    <div
      data-mid={match.id}
      className={cn(
        "w-[110px] overflow-hidden rounded-lg border bg-panel/80 sm:w-[132px]",
        winner
          ? "border-gold/50 shadow-[0_0_18px_-6px_rgba(247,200,67,0.6)]"
          : match.live
            ? "border-red/40"
            : "border-border",
        className,
      )}
    >
      <TeamRow {...rowFor(aId, score?.a)} />
      <div className="h-px bg-border/70" />
      <TeamRow {...rowFor(bId, score?.b)} />
      {footer}
    </div>
  );
}
