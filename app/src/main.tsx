import "./polyfills";
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App";
import { SolanaWalletProvider } from "./lib/wallet-provider";
import { PredictionProvider } from "./lib/prediction-store";
import "./index.css";

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
