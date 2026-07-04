import { GitFork, ListChecks, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MIN_STAKE_SOL } from "@/lib/config";
import logoUrl from "@assets/logo_02.webp";
import trophyUrl from "@assets/trophy.webp";

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-2 p-5 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan/40 bg-cyan/10 text-cyan">
        {icon}
      </span>
      <div className="font-bold">{title}</div>
      <div className="text-sm text-muted">{desc}</div>
    </Card>
  );
}

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-12 text-center">
      <img
        src={trophyUrl}
        alt=""
        aria-hidden
        className="pointer-events-none mb-4 h-40 w-auto select-none drop-shadow-[0_0_44px_rgba(247,200,67,0.45)] sm:h-52"
      />
      <img src={logoUrl} alt="Cup Predict" className="h-12 w-auto select-none sm:h-16" />

      <h1 className="mt-6 max-w-2xl text-2xl font-extrabold sm:text-4xl">
        Predict the entire bracket. <span className="text-gold">Closest wins the pot.</span>
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Call every match of the knockout cup, stake in SOL, and the bracket closest to reality
        takes the whole prize pool. Winner takes all.
      </p>

      <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
        <Feature
          icon={<GitFork size={20} />}
          title="Fill your bracket"
          desc="Pick the winner of every remaining match, all the way to the champion."
        />
        <Feature
          icon={<ListChecks size={20} />}
          title={`Stake from ${MIN_STAKE_SOL} SOL`}
          desc="100% of every stake goes straight into the prize pool. No house cut."
        />
        <Feature
          icon={<Target size={20} />}
          title="Closest wins it all"
          desc="The bracket that matches the most real results wins the entire pot."
        />
      </div>

      <div className="mt-9 flex flex-col items-center gap-3">
        <Button variant="gold" size="lg" className="px-10" onClick={onEnter}>
          Launch app →
        </Button>
      </div>
    </div>
  );
}
