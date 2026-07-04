import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Copy, GitFork, LineChart, LogOut, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePhantomConnect } from "@/lib/wallet-provider";
import { cn } from "@/lib/utils";
import { shortAddr } from "@/lib/format";
import logoUrl from "@assets/logo_02.webp";

export type Tab = "bracket" | "predictions";

const X_URL = "https://x.com/cupbracketPF";

/** X (formerly Twitter) logo. */
function XIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors",
        active ? "text-cyan" : "text-muted hover:text-fg",
      )}
    >
      {icon}
      {label}
      {active && (
        <span className="absolute -bottom-[13px] left-0 h-0.5 w-full rounded-full bg-cyan glow-cyan" />
      )}
    </button>
  );
}

/** Connected-wallet button with a disconnect dropdown. */
function WalletMenu() {
  const { publicKey, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const address = publicKey?.toBase58() ?? "";

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setOpen((o) => !o)} title="Wallet">
        <Wallet size={16} />
        {shortAddr(address)}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-panel p-2 shadow-2xl">
            <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-muted">
              Connected wallet
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(address);
                toast.success("Address copied");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left font-mono text-xs text-fg transition-colors hover:bg-panel-2"
            >
              <Copy size={13} className="shrink-0 text-muted" />
              <span className="truncate">{address}</span>
            </button>
            <button
              onClick={() => {
                disconnect().catch(() => undefined);
                setOpen(false);
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-semibold text-red transition-colors hover:bg-red/10"
            >
              <LogOut size={14} /> Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Header({
  activeTab,
  onTabChange,
  onLogoClick,
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  onLogoClick: () => void;
}) {
  const { connected, connecting } = useWallet();
  const connectPhantom = usePhantomConnect();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo (opens landing) + X link */}
        <div className="flex items-center gap-2">
          <button onClick={onLogoClick} className="flex items-center" title="About Cup Bracket">
            <img
              src={logoUrl}
              alt="Cup Bracket"
              className="h-10 w-auto select-none sm:h-12"
              draggable={false}
            />
          </button>
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted transition-colors hover:border-cyan/60 hover:text-fg"
            title="Follow on X"
            aria-label="X (Twitter)"
          >
            <XIcon />
          </a>
        </div>

        {/* Tabs */}
        <nav className="hidden items-center gap-1 border-b-0 md:flex">
          <TabButton
            active={activeTab === "bracket"}
            onClick={() => onTabChange("bracket")}
            icon={<GitFork size={16} />}
            label="Bracket"
          />
          <TabButton
            active={activeTab === "predictions"}
            onClick={() => onTabChange("predictions")}
            icon={<LineChart size={16} />}
            label="My Bracket"
          />
        </nav>

        {/* Wallet */}
        <div className="flex items-center gap-2 sm:gap-3">
          {connected ? (
            <WalletMenu />
          ) : (
            <Button variant="primary" onClick={connectPhantom} disabled={connecting}>
              <Wallet size={16} />
              {connecting ? "Connecting…" : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <nav className="flex items-center justify-center gap-1 border-t border-border/60 py-1 md:hidden">
        <TabButton
          active={activeTab === "bracket"}
          onClick={() => onTabChange("bracket")}
          icon={<GitFork size={16} />}
          label="Bracket"
        />
        <TabButton
          active={activeTab === "predictions"}
          onClick={() => onTabChange("predictions")}
          icon={<LineChart size={16} />}
          label="My Bracket"
        />
      </nav>
    </header>
  );
}
