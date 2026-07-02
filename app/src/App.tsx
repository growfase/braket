import { useState } from "react";
import { Header, type Tab } from "@/components/layout/header";
import { FooterStats } from "@/components/layout/footer-stats";
import { BootSplash } from "@/components/layout/boot-splash";
import { BracketView } from "@/components/bracket/bracket-view";
import { MyPredictions } from "@/components/predictions/my-predictions";
import { LandingPage } from "@/components/landing/landing-page";
import bgUrl from "@assets/background.webp";

const ENTERED_KEY = "cup-predict:entered";

export default function App() {
  const [tab, setTab] = useState<Tab>("bracket");
  const [booting, setBooting] = useState(true);
  const [entered, setEntered] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ENTERED_KEY) === "1";
    } catch {
      return false;
    }
  });

  function enter() {
    setEntered(true);
    try {
      localStorage.setItem(ENTERED_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Page background: space globe + grid, with a dark overlay for readability */}
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,7,15,0.55)_0%,rgba(5,7,15,0.45)_38%,rgba(5,7,15,0.78)_100%)]"
      />

      {booting && <BootSplash onDone={() => setBooting(false)} />}

      {!entered ? (
        <LandingPage onEnter={enter} />
      ) : (
        <>
          <Header activeTab={tab} onTabChange={setTab} />
          <main className="flex-1">
            {tab === "bracket" ? <BracketView /> : <MyPredictions />}
          </main>
          <FooterStats />
        </>
      )}
    </div>
  );
}
