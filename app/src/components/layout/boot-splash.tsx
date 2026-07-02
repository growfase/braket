import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import logoUrl from "@assets/logo_02.webp";
import trophyUrl from "@assets/trophy.webp";
import bgUrl from "@assets/background.webp";

/** Brief boot loader — fades out once the key art has preloaded (or after a cap). */
export function BootSplash({ onDone }: { onDone: () => void }) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setHide(true);
      setTimeout(onDone, 350);
    };
    const urls = [trophyUrl, bgUrl, logoUrl];
    let loaded = 0;
    urls.forEach((u) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded += 1;
        if (loaded >= urls.length) finish();
      };
      img.src = u;
    });
    const cap = setTimeout(finish, 2500);
    return () => clearTimeout(cap);
  }, [onDone]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-bg transition-opacity duration-300",
        hide && "pointer-events-none opacity-0",
      )}
    >
      <img src={logoUrl} alt="Cup Predict" className="h-11 w-auto select-none sm:h-14" />
      <Loader2 size={22} className="animate-spin text-cyan" />
    </div>
  );
}
