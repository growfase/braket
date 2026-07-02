import { Crown, Lock, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/ui/flag";
import { usePredictions } from "@/lib/prediction-store";
import { matchCompetitors } from "@/lib/bracket-logic";
import { FINAL_MATCH_ID, MATCH_BY_ID, RESULTS, TEAM_BY_ID } from "@/lib/tournament-data";
import { fmtSol } from "@/lib/format";
import { cn } from "@/lib/utils";
import trophyUrl from "@assets/trophy.webp";

function Finalist({
  teamId,
  align,
  isChampion,
  clickable,
  onPick,
}: {
  teamId?: string;
  align: "left" | "right";
  isChampion: boolean;
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
        "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
        align === "right" && "flex-row-reverse text-right",
        clickable && "cursor-pointer hover:bg-panel-2",
        isChampion && "bg-gold/15 ring-1 ring-gold",
      )}
    >
      {team ? (
        <Flag iso={team.iso} code={team.code} size={20} />
      ) : (
        <span className="inline-block h-[20px] w-7 rounded-[3px] bg-border/60" />
      )}
      <span className={cn("text-base font-extrabold", isChampion && "text-gold")}>
        {team?.code ?? "TBD"}
      </span>
    </button>
  );
}

export function CenterTrophy({ onPlace }: { onPlace: () => void }) {
  const { picks, pick, championId, predicted, toPredict, complete, poolSol, locked, reset } =
    usePredictions();

  const effective = { ...RESULTS, ...picks };
  const { aId, bId } = matchCompetitors(MATCH_BY_ID[FINAL_MATCH_ID], effective);
  const finalReady = Boolean(aId && bId);
  const pct = toPredict > 0 ? Math.round((predicted / toPredict) * 100) : 0;

  return (
    <div className="relative flex min-h-[440px] w-full max-w-[300px] items-center justify-center sm:min-h-[600px]">
      {/* Trophy — big centerpiece in the middle of the bracket */}
      <img
        src={trophyUrl}
        alt="Trophy"
        draggable={false}
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[340px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none drop-shadow-[0_0_60px_rgba(247,200,67,0.5)] sm:h-[600px]"
      />

      {/* Info overlaid on the trophy */}
      <div className="relative z-10 flex w-full flex-col items-center gap-3">
        {/* Prize pot */}
        <div className="w-full rounded-2xl border border-gold/40 bg-gold/5 px-5 py-4 text-center glow-gold backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-gold/80">
            Prize Pot
          </div>
          <div className="text-3xl font-black text-gold">{fmtSol(poolSol, 2)}</div>
          <div className="text-xs text-muted">Closest bracket wins it all</div>
        </div>

        {/* Final — the last pick decides your champion */}
        <div className="w-full">
          <div className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted">
            Final · Your Champion
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-cyan/30 bg-panel/70 px-3 py-3 glow-cyan backdrop-blur-sm">
            <Finalist
              teamId={aId}
              align="left"
              isChampion={!!championId && championId === aId}
              clickable={finalReady && !locked}
              onPick={() => aId && pick(FINAL_MATCH_ID, aId)}
            />
            <span className="text-sm font-black text-muted">VS</span>
            <Finalist
              teamId={bId}
              align="right"
              isChampion={!!championId && championId === bId}
              clickable={finalReady && !locked}
              onPick={() => bId && pick(FINAL_MATCH_ID, bId)}
            />
          </div>
          {!finalReady && (
            <p className="mt-2 text-center text-[11px] text-muted">
              Fill both semi-finals to unlock the final.
            </p>
          )}
          {finalReady && !championId && !locked && (
            <p className="mt-2 text-center text-[11px] text-gold">Tap the champion 👑</p>
          )}
        </div>

        {/* Progress */}
        <div className="w-full">
          <div className="mb-1 flex justify-between text-[11px] font-semibold text-muted">
            <span>Bracket filled</span>
            <span>
              {predicted} / {toPredict}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel-2">
            <div
              className="h-full rounded-full bg-cyan transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* CTA / state */}
        {locked ? (
          <div className="flex w-full flex-col items-center gap-3">
            <Badge tone="cyan" className="px-3 py-1">
              <Lock size={13} /> Prediction Locked
            </Badge>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw size={14} /> New prediction
            </Button>
          </div>
        ) : complete ? (
          <Button variant="gold" size="lg" className="w-full" onClick={onPlace}>
            <Crown size={16} /> Place Prediction
          </Button>
        ) : (
          <p className="text-center text-sm text-muted">
            Pick every remaining match to complete your bracket.
          </p>
        )}
      </div>
    </div>
  );
}
