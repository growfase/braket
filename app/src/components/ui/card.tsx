import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-panel/70 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "cyan" | "gold" | "green" | "red";
}) {
  const tones: Record<string, string> = {
    neutral: "border-border text-muted",
    cyan: "border-cyan/40 text-cyan bg-cyan/10",
    gold: "border-gold/40 text-gold bg-gold/10",
    green: "border-green/40 text-green bg-green/10",
    red: "border-red/40 text-red bg-red/10",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
