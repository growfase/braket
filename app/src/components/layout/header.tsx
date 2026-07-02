import { useWallet } from "@solana/wallet-adapter-react";
import { GitFork, LineChart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePhantomConnect } from "@/lib/wallet-provider";
import { cn } from "@/lib/utils";
import { shortAddr } from "@/lib/format";
import logoUrl from "@assets/logo_braket_1.webp";

export type Tab = "bracket" | "predictions";

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

export function Header({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
}) {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const connectPhantom = usePhantomConnect();

  const address = publicKey?.toBase58();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={logoUrl}
            alt="Cup Predict"
            className="h-10 w-auto select-none sm:h-12"
            draggable={false}
          />
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
            label="Predictions"
          />
        </nav>

        {/* Wallet */}
        <div className="flex items-center gap-2 sm:gap-3">
          {connected && address ? (
            <Button variant="outline" onClick={() => disconnect()} title="Disconnect">
              <Wallet size={16} />
              {shortAddr(address)}
            </Button>
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
          label="Predictions"
        />
      </nav>
    </header>
  );
}
