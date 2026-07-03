import { useRef, useState } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { BracketSide } from "./bracket-side";
import { CenterTrophy } from "./center-trophy";
import { BracketConnectors } from "./bracket-connectors";
import { StakeModal } from "@/components/predict/stake-modal";
import { Button } from "@/components/ui/button";
import { usePredictions } from "@/lib/prediction-store";
import type { BracketMode } from "./match-card";
import { cn } from "@/lib/utils";

function ViewToggle({
  mode,
  onChange,
}: {
  mode: BracketMode;
  onChange: (m: BracketMode) => void;
}) {
  const options: { id: BracketMode; label: string }[] = [
    { id: "picks", label: "Your bracket" },
    { id: "results", label: "Actual results" },
  ];
  return (
    <div className="inline-flex rounded-xl border border-border bg-panel/70 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors",
            mode === o.id ? "bg-cyan text-[#03121a]" : "text-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function BracketView() {
  const [stakeOpen, setStakeOpen] = useState(false);
  const [mode, setMode] = useState<BracketMode>("picks");
  const desktopRef = useRef<HTMLDivElement>(null);
  const openStake = () => setStakeOpen(true);
  const { reset, predicted, locked } = usePredictions();

  function handleReset() {
    if (predicted === 0) return;
    if (window.confirm("Reset your bracket? This clears all your picks.")) {
      reset();
      toast.success("Bracket reset");
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-5 sm:px-6 sm:py-6">
      <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
        <ViewToggle mode={mode} onChange={setMode} />
        {!locked && predicted > 0 && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw size={14} /> Reset bracket
          </Button>
        )}
      </div>

      {/* Mobile / tablet: champion picker on top, bracket scrolls below */}
      <div className="space-y-6 lg:hidden">
        <div className="flex justify-center">
          <CenterTrophy onPlace={openStake} />
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            {mode === "picks" ? "Fill your bracket" : "Who advanced"}
          </div>
          <div className="-mx-3 flex gap-4 overflow-x-auto px-3 pb-3">
            <BracketSide side="left" mode={mode} />
            <BracketSide side="right" mode={mode} />
          </div>
        </div>
      </div>

      {/* Desktop: left half | trophy | right half.
          Centers when it fits; scrolls from the left (R32 first) when it doesn't. */}
      <div className="hidden overflow-x-auto pb-4 lg:block">
        <div ref={desktopRef} className="relative mx-auto flex w-max items-center gap-5 xl:gap-8">
          <BracketConnectors containerRef={desktopRef} />
          <div className="relative z-10">
            <BracketSide side="left" mode={mode} />
          </div>
          <div className="relative z-10 flex shrink-0 items-center justify-center px-1">
            <CenterTrophy onPlace={openStake} />
          </div>
          <div className="relative z-10">
            <BracketSide side="right" mode={mode} />
          </div>
        </div>
      </div>

      <StakeModal open={stakeOpen} onClose={() => setStakeOpen(false)} />
    </div>
  );
}
