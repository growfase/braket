import "./polyfills";
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App";
import { SolanaWalletProvider } from "./lib/wallet-provider";
import { PredictionProvider } from "./lib/prediction-store";
import { isSupabaseEnabled } from "./lib/supabase";
import { fetchMatches } from "./lib/supabase-data";
import { applyDbMatches } from "./lib/tournament-data";
import "./index.css";

/** Load the live bracket from Supabase before the first render (falls back to bundled data). */
async function hydrate() {
  if (!isSupabaseEnabled) return;
  try {
    const rows = await Promise.race([
      fetchMatches(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);
    if (rows && rows.length) applyDbMatches(rows);
  } catch {
    /* keep the bundled fallback data */
  }
}

hydrate().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <SolanaWalletProvider>
        <PredictionProvider>
          <App />
          <Toaster
            theme="dark"
            position="top-center"
            toastOptions={{
              style: {
                background: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                color: "var(--color-fg)",
              },
            }}
          />
        </PredictionProvider>
      </SolanaWalletProvider>
    </React.StrictMode>,
  );
});
