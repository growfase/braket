import { Inbox, Lock } from "lucide-react";
import { Card, Badge } from "@/components/ui/card";
import { Flag } from "@/components/ui/flag";
import { usePredictions } from "@/lib/prediction-store";
import { TEAM_BY_ID } from "@/lib/tournament-data";
import { fmtRelative, fmtSol, shortAddr } from "@/lib/format";
import type { Prediction } from "@/lib/types";

function statusBadge(p: Prediction) {
  if (p.status === "won") return <Badge tone="green">Won</Badge>;
  if (p.status === "lost") return <Badge tone="red">Lost</Badge>;
  return <Badge tone="gold">Pending</Badge>;
}

function PredictionCard({ p }: { p: Prediction }) {
  const score =
    p.gradedResults > 0 ? `${p.correctPicks}/${p.gradedResults} correct` : "Awaiting results";
  return (
    <Card className="flex items-center justify-between gap-4 p-4">
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
    </Card>
  );
}

export function MyPredictions() {
  const { predictions } = usePredictions();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <Lock size={18} className="text-cyan" />
        <h1 className="text-xl font-extrabold">My Predictions</h1>
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
