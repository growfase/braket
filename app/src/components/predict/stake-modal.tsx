import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { CheckCircle2, Gift, Loader2, Target, Trophy, Wallet } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/ui/flag";
import { SolanaIcon } from "@/components/ui/solana-icon";
import { MiniBracket } from "./mini-bracket";
import { usePredictions } from "@/lib/prediction-store";
import { usePhantomConnect } from "@/lib/wallet-provider";
import { TEAM_BY_ID } from "@/lib/tournament-data";
import { MIN_STAKE_SOL, QUICK_STAKES } from "@/lib/config";
import { fmtSol } from "@/lib/format";
import { cn } from "@/lib/utils";

function ModalTitle() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-cyan/40 bg-cyan/10 text-cyan">
        <Trophy size={20} />
      </span>
      <div>
        <div className="text-lg font-bold text-fg">Submit your bracket</div>
        <div className="text-xs font-normal text-muted">
          Review your picks and submit your full tournament bracket.
        </div>
      </div>
    </div>
  );
}

export function StakeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { publicKey, connected } = useWallet();
  const connectPhantom = usePhantomConnect();
  const { championId, submit } = usePredictions();
  const [amount, setAmount] = useState<number>(MIN_STAKE_SOL);
  const [submitting, setSubmitting] = useState(false);

  const champion = championId ? TEAM_BY_ID[championId] : undefined;
  const valid = Number.isFinite(amount) && amount >= MIN_STAKE_SOL;

  function handleConfirm() {
    if (!connected || !publicKey) {
      connectPhantom();
      return;
    }
    // Mock a brief network round-trip so the submit shows a loading state.
    setSubmitting(true);
    window.setTimeout(() => {
      const res = submit(publicKey.toBase58(), amount);
      setSubmitting(false);
      if (!res.ok) {
        toast.error(res.error ?? "Could not submit bracket.");
        return;
      }
      toast.success(`Bracket submitted — champion ${champion?.code}. (mock, no SOL sent)`);
      onClose();
    }, 700);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<ModalTitle />}
      className="max-h-[90vh] max-w-[560px] overflow-y-auto"
    >
      {/* Bracket complete + mini bracket */}
      <div className="rounded-2xl border border-border bg-bg-soft/60 p-3">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-cyan" />
          <div>
            <div className="font-bold text-cyan">Bracket complete</div>
            <div className="text-xs text-muted">Your picks are locked for every round</div>
          </div>
        </div>
        <MiniBracket />
      </div>

      {/* Champion */}
      <div className="mt-4">
        <div className="mb-1 text-sm font-semibold text-muted">Champion</div>
        <div className="flex items-center justify-between rounded-xl border border-gold/50 bg-gold/10 px-4 py-3">
          <div className="flex items-center gap-2">
            {champion && <Flag iso={champion.iso} code={champion.code} size={22} />}
            <span className="text-lg font-extrabold text-gold">{champion?.name ?? "—"}</span>
          </div>
          <Trophy size={18} className="text-gold" />
        </div>
      </div>

      {/* Closest bracket wins */}
      <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-bg-soft/60 px-4 py-3">
        <Target size={20} className="shrink-0 text-cyan" />
        <div>
          <div className="font-bold text-fg">Closest bracket wins</div>
          <div className="text-xs text-muted">Score updates after each match</div>
        </div>
      </div>

      {/* Stake */}
      <label className="mb-1 mt-4 block text-sm font-semibold text-muted">Stake (SOL)</label>
      <div className="flex items-center gap-2">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-bg-soft">
          <SolanaIcon size={18} />
        </span>
        <input
          type="number"
          min={MIN_STAKE_SOL}
          step={0.1}
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          className={cn(
            "h-11 w-full rounded-xl border bg-bg-soft px-3 text-base font-bold outline-none transition-colors",
            valid ? "border-border focus:border-cyan" : "border-red/60",
          )}
        />
        <span className="text-sm font-bold text-muted">SOL</span>
      </div>
      <div className="mt-2 flex gap-2">
        {QUICK_STAKES.map((q) => (
          <button
            key={q}
            onClick={() => setAmount(q)}
            className={cn(
              "flex-1 rounded-lg border px-2 py-2 text-sm font-semibold transition-colors",
              amount === q ? "border-cyan text-cyan" : "border-border text-muted hover:text-fg",
            )}
          >
            {q} SOL
          </button>
        ))}
      </div>
      {!valid && (
        <p className="mt-2 text-xs font-semibold text-red">
          Minimum stake is {MIN_STAKE_SOL} SOL.
        </p>
      )}

      {/* Prize pool — 100% of the stake */}
      <div className="mt-4 rounded-xl border border-border bg-bg-soft/60 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted">
            <Gift size={16} className="text-cyan" /> Prize pool (100%)
          </span>
          <span className="font-bold text-cyan">{valid ? fmtSol(amount) : "—"}</span>
        </div>
      </div>

      <Button
        variant="gold"
        size="lg"
        className="mt-5 w-full"
        disabled={!valid || submitting}
        onClick={handleConfirm}
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Submitting…
          </>
        ) : connected ? (
          <>
            <Wallet size={16} /> Submit bracket · {valid ? fmtSol(amount) : "—"}
          </>
        ) : (
          <>
            <Wallet size={16} /> Connect wallet to submit
          </>
        )}
      </Button>
      <p className="mt-2 text-center text-[11px] text-muted">
        v1 mock — no SOL leaves your wallet yet.
      </p>
    </Modal>
  );
}
