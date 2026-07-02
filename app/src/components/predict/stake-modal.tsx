import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { toast } from "sonner";
import QRCode from "qrcode";
import {
  CheckCircle2,
  Copy,
  Gift,
  Loader2,
  PartyPopper,
  Target,
  Trophy,
  Wallet,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/ui/flag";
import { SolanaIcon } from "@/components/ui/solana-icon";
import { MiniBracket } from "./mini-bracket";
import { usePredictions } from "@/lib/prediction-store";
import { usePhantomConnect } from "@/lib/wallet-provider";
import { createPrediction, checkPayment } from "@/lib/supabase-data";
import { TEAM_BY_ID } from "@/lib/tournament-data";
import { MIN_STAKE_SOL, QUICK_STAKES } from "@/lib/config";
import { fmtSol } from "@/lib/format";
import { cn } from "@/lib/utils";

type Step = "review" | "creating" | "pay" | "success";
interface Deposit {
  predictionId: string;
  address: string;
  amount: number;
}

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

/** Two-step progress header shown on the deposit / success screens. */
function DepositSteps({ done = false }: { done?: boolean }) {
  return (
    <div className="mb-4 flex w-full items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
      <span className="flex items-center gap-1.5 text-cyan">
        <CheckCircle2 size={13} /> Bracket
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-cyan/50 to-gold/50" />
      <span className={cn("flex items-center gap-1.5", done ? "text-cyan" : "text-gold")}>
        {done ? <CheckCircle2 size={13} /> : <Wallet size={13} />} Deposit
      </span>
    </div>
  );
}

export function StakeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const connectPhantom = usePhantomConnect();
  const { championId, picks, poolSol, recordPrediction, refreshPool } = usePredictions();

  const [amount, setAmount] = useState<number>(MIN_STAKE_SOL);
  const [step, setStep] = useState<Step>("review");
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const champion = championId ? TEAM_BY_ID[championId] : undefined;
  const valid = Number.isFinite(amount) && amount >= MIN_STAKE_SOL;

  function handleClose() {
    setStep("review");
    setDeposit(null);
    setQr(null);
    setPaying(false);
    onClose();
  }

  // Generate a Solana-Pay QR for the deposit.
  useEffect(() => {
    if (!deposit) {
      setQr(null);
      return;
    }
    QRCode.toDataURL(`solana:${deposit.address}?amount=${deposit.amount}`, {
      margin: 1,
      width: 220,
      color: { dark: "#e9eefb", light: "#0d1324" },
    })
      .then(setQr)
      .catch(() => setQr(null));
  }, [deposit]);

  function finalizePaid(d: Deposit, wallet?: string | null) {
    recordPrediction({
      wallet: wallet ?? (publicKey ? publicKey.toBase58() : ""),
      stakeSol: d.amount,
      depositAddress: d.address,
      paymentStatus: "paid",
    });
    void refreshPool();
    setStep("success");
  }

  // Poll for payment while on the pay step.
  useEffect(() => {
    if (step !== "pay" || !deposit) return;
    let active = true;
    const tick = async () => {
      const r = await checkPayment(deposit.predictionId);
      if (active && r.paid) finalizePaid(deposit, r.wallet);
    };
    const id = setInterval(tick, 4000);
    return () => {
      active = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, deposit]);

  async function handleConfirm() {
    setStep("creating");
    const res = await createPrediction({
      wallet: connected && publicKey ? publicKey.toBase58() : undefined,
      picks,
      championTeamId: championId!,
      stakeSol: amount,
    });
    if (!res.ok || !res.depositAddress || !res.predictionId) {
      toast.error(res.error ?? "Could not create prediction.");
      setStep("review");
      return;
    }
    setDeposit({ predictionId: res.predictionId, address: res.depositAddress, amount: res.amountSol ?? amount });
    setStep("pay");
  }

  async function payWithPhantom() {
    if (!deposit) return;
    if (!connected || !publicKey) {
      connectPhantom();
      return;
    }
    try {
      setPaying(true);
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(deposit.address),
          lamports: Math.round(deposit.amount * LAMPORTS_PER_SOL),
        }),
      );
      const sig = await sendTransaction(tx, connection);
      toast.message("Payment sent — confirming…");
      await connection.confirmTransaction(sig, "confirmed");
      const r = await checkPayment(deposit.predictionId);
      if (r.paid) finalizePaid(deposit, r.wallet ?? publicKey.toBase58());
      else toast.message("Waiting for the network to reflect the deposit…");
    } catch {
      toast.error("Payment failed or was cancelled.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={<ModalTitle />}
      className="max-h-[90vh] max-w-[560px] overflow-y-auto"
    >
      {step === "review" && (
        <>
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

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-bg-soft/60 px-4 py-3">
            <Target size={20} className="shrink-0 text-cyan" />
            <div>
              <div className="font-bold text-fg">Closest bracket wins</div>
              <div className="text-xs text-muted">Score updates after each match</div>
            </div>
          </div>

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

          <div className="mt-4 space-y-2 rounded-xl border border-border bg-bg-soft/60 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted">
                <Gift size={16} className="text-cyan" /> Current prize pool
              </span>
              <span className="font-semibold text-fg">{fmtSol(poolSol)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Your stake · 100% added</span>
              <span className="font-semibold text-fg">{valid ? `+${fmtSol(amount)}` : "—"}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="font-semibold text-fg">Pool if you enter</span>
              <span className="font-extrabold text-cyan">
                {fmtSol(poolSol + (valid ? amount : 0))}
              </span>
            </div>
          </div>

          <Button
            variant="gold"
            size="lg"
            className="mt-5 w-full"
            disabled={!valid}
            onClick={handleConfirm}
          >
            <CheckCircle2 size={16} />
            Confirm bracket · {valid ? fmtSol(amount) : "—"}
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted">
            A unique deposit address is generated next — pay from any Solana wallet (devnet).
          </p>
        </>
      )}

      {step === "creating" && (
        <div className="flex flex-col items-center">
          <DepositSteps />
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Loader2 size={28} className="animate-spin text-cyan" />
            <div className="font-bold">Generating your deposit wallet…</div>
            <div className="text-sm text-muted">Saving your bracket securely.</div>
          </div>
        </div>
      )}

      {step === "pay" && deposit && (
        <div className="flex flex-col items-center">
          <DepositSteps />

          {/* Amount */}
          <div className="w-full rounded-2xl border border-gold/40 bg-gold/[0.06] p-4 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Amount to send
            </div>
            <div className="mt-1 flex items-center justify-center gap-2 text-3xl font-black text-gold">
              <SolanaIcon size={20} /> {fmtSol(deposit.amount)}
            </div>
            <div className="mt-1 text-[11px] text-muted">
              Send the exact amount · 100% funds the prize pool
            </div>
          </div>

          {/* QR */}
          <div className="mt-4 rounded-2xl border border-border bg-white/[0.02] p-3">
            {qr ? (
              <img
                src={qr}
                alt="Deposit QR"
                className="block rounded-lg"
                width={200}
                height={200}
              />
            ) : (
              <div className="grid h-[200px] w-[200px] place-items-center">
                <Loader2 size={22} className="animate-spin text-muted" />
              </div>
            )}
          </div>
          <div className="mt-1.5 text-[11px] text-muted">Scan with any Solana wallet</div>

          {/* Address */}
          <div className="mt-3 w-full">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Deposit address · devnet
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(deposit.address);
                toast.success("Address copied");
              }}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-bg-soft px-3 py-2.5 font-mono text-xs text-fg transition-colors hover:border-cyan/60"
              title={deposit.address}
            >
              <span className="truncate">{deposit.address}</span>
              <Copy size={14} className="shrink-0 text-muted" />
            </button>
          </div>

          <Button
            variant="gold"
            size="lg"
            className="mt-4 w-full"
            disabled={paying}
            onClick={payWithPhantom}
          >
            {paying ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Confirming payment…
              </>
            ) : (
              <>
                <Wallet size={16} /> Pay with Phantom
              </>
            )}
          </Button>

          <div className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan/25 bg-cyan/5 px-3 py-2 text-xs font-medium text-muted">
            <Loader2 size={13} className="animate-spin text-cyan" /> Waiting for your deposit —
            detected automatically
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center">
          <DepositSteps done />
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-gold/10">
              <PartyPopper size={28} className="text-gold" />
            </div>
            <div className="text-lg font-extrabold text-gold">Prediction confirmed!</div>
            <div className="max-w-xs text-sm text-muted">
              Your {deposit ? fmtSol(deposit.amount) : ""} deposit was detected and your bracket is
              locked. Track it under My Predictions — the closest bracket wins the pot.
            </div>
            <Button variant="primary" size="lg" className="mt-1 w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
