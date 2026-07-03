import { useEffect, useState } from "react";
import { ChevronDown, Inbox, Lock, Users } from "lucide-react";
import { Card, Badge } from "@/components/ui/card";
import { Flag } from "@/components/ui/flag";
import { MiniBracket } from "@/components/predict/mini-bracket";
import { usePredictions } from "@/lib/prediction-store";
import { fetchBracketGroup } from "@/lib/supabase-data";
import { TEAM_BY_ID } from "@/lib/tournament-data";
import { fmtRelative, fmtSol, shortAddr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Prediction } from "@/lib/types";

function statusBadge(p: Prediction) {
  if (p.status === "won") return <Badge tone="green">Won</Badge>;
  if (p.status === "lost") return <Badge tone="red">Lost</Badge>;
  return <Badge tone="gold">Pending</Badge>;
}

function PredictionCard({ p }: { p: Prediction }) {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<{ count: number; totalStake: number } | null>(null);

  // How many paid players share this exact bracket + their total stake.
  useEffect(() => {
    if (!p.bracketHash) return;
    let active = true;
    void fetchBracketGroup(p.bracketHash).then((g) => {
      if (active) setGroup(g);
    });
    return () => {
      active = false;
    };
  }, [p.bracketHash]);

  const score =
    p.gradedResults > 0 ? `${p.correctPicks}/${p.gradedResults} correct` : "Awaiting results";

  const players = Math.max(group?.count ?? 1, 1);
  const totalStake = group && group.totalStake > 0 ? group.totalStake : p.stakeSol;
  const sharePct = Math.round((p.stakeSol / totalStake) * 100);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl border border-gold/40 bg-gold/10">
            <Flag iso={TEAM_BY_ID[p.championId]?.iso} code={p.championCode} size={24} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{p.championName}</span>
              <span className="text-xs text-muted">predicted champion</span>
            </div>
            <div className="text-xs text-muted">
              {shortAddr(p.wallet)} · {fmtRelative(p.createdAt)} · {score}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-muted">Stake</div>
            <div className="font-bold text-gold">{fmtSol(p.stakeSol)}</div>
          </div>
          {statusBadge(p)}
        </div>
      </div>

      {/* Identical-bracket group: players sharing it + stake-weighted share */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/60 pt-3 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Users size={13} className="text-cyan" />
          Shared by <b className="text-fg">{players}</b> {players === 1 ? "player" : "players"}
        </span>
        <span>
          · <b className="text-fg">{fmtSol(totalStake)}</b> staked total
        </span>
        <span>
          · your share <b className="text-gold">~{sharePct}%</b>
        </span>
      </div>

      {/* Full bracket (collapsible) */}
      {p.picks && (
        <>
          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-cyan hover:underline"
          >
            <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
            {open ? "Hide bracket" : "View full bracket"}
          </button>
          {open && (
            <div className="no-scrollbar mt-3 overflow-x-auto rounded-xl border border-border bg-bg-soft/60 p-3">
              <MiniBracket picks={p.picks} />
            </div>
          )}
        </>
      )}
    </Card>
  );
}

export function MyPredictions() {
  const { predictions } = usePredictions();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <Lock size={18} className="text-cyan" />
        <h1 className="text-xl font-extrabold">My Bracket</h1>
        <Badge className="ml-1">{predictions.length}</Badge>
      </div>

      {predictions.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Inbox size={40} className="text-muted" />
          <div className="font-bold">No predictions yet</div>
          <p className="max-w-sm text-sm text-muted">
            Fill in the whole bracket and lock a prediction with at least 0.1 SOL. The bracket
            closest to the real results wins the entire prize pool.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {predictions.map((p) => (
            <PredictionCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
