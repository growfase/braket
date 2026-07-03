import { useEffect, useState } from "react";
import { CalendarClock, ListChecks, Lock, Trophy } from "lucide-react";
import { usePredictions } from "@/lib/prediction-store";
import { PREDICTION_DEADLINE } from "@/lib/config";
import { TEAM_BY_ID } from "@/lib/tournament-data";
import { fmtCountdown, fmtDate } from "@/lib/format";
import { Flag } from "@/components/ui/flag";

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-panel/70 text-cyan">
        {icon}
      </span>
      <div className="min-w-0 leading-tight">
        <div className="text-xs text-muted">{label}</div>
        <div className="truncate font-bold text-fg">{value}</div>
        {sub && <div className="truncate text-[11px] text-muted">{sub}</div>}
      </div>
    </div>
  );
}

export function FooterStats() {
  const { championId, predicted, toPredict, complete, locked } = usePredictions();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const champ = championId ? TEAM_BY_ID[championId] : undefined;
  const status = locked ? "Locked" : complete ? "Ready to place" : "Filling bracket";
  const msLeft = PREDICTION_DEADLINE - now;

  return (
    <footer className="border-t border-border/70 bg-bg/70 backdrop-blur-md">
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-4 px-4 py-4 sm:gap-5 sm:px-6 md:grid-cols-4">
        <Stat
          icon={<Trophy size={18} />}
          label="Predicted champion"
          value={
            champ ? (
              <span className="flex items-center gap-1.5">
                <Flag iso={champ.iso} code={champ.code} size={14} />
                {champ.code}
              </span>
            ) : (
              "·"
            )
          }
          sub={champ?.name}
        />
        <Stat
          icon={<ListChecks size={18} />}
          label="Bracket"
          value={`${predicted} / ${toPredict}`}
          sub="matches predicted"
        />
        <Stat icon={<Lock size={18} />} label="Status" value={status} />
        <Stat
          icon={<CalendarClock size={18} />}
          label="Final"
          value={fmtDate(PREDICTION_DEADLINE)}
          sub={msLeft > 0 ? `${fmtCountdown(msLeft)} left` : "Closed"}
        />
      </div>
    </footer>
  );
}
