import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SOLANA_RPC_URL } from "./config";

const PHANTOM = "Phantom";

/**
 * Solana wallet context. v1 only needs *connect* (to identify the user) — no
 * transactions yet. Phantom registers via the Wallet Standard, so we can select
 * it directly (see `usePhantomConnect`) without showing a multi-wallet modal.
 */
export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => SOLANA_RPC_URL, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

/**
 * Returns a callback that connects to **Phantom only**. Selects the Phantom
 * adapter and connects once it's active; if Phantom isn't installed, opens the
 * Phantom download page.
 */
export function usePhantomConnect(): () => void {
  const { wallets, wallet, select, connect, connected, connecting } = useWallet();
  const pending = useRef(false);

  useEffect(() => {
    if (pending.current && wallet?.adapter.name === PHANTOM && !connected && !connecting) {
      pending.current = false;
      connect().catch(() => undefined);
    }
  }, [wallet, connected, connecting, connect]);

  return useCallback(() => {
    const phantom = wallets.find((w) => w.adapter.name === PHANTOM);
    if (!phantom) {
      window.open("https://phantom.app/download", "_blank", "noopener,noreferrer");
      return;
    }
    if (wallet?.adapter.name === PHANTOM) {
      connect().catch(() => undefined);
      return;
    }
    pending.current = true;
    select(phantom.adapter.name);
  }, [wallets, wallet, select, connect]);
}
