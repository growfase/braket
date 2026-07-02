import { cn } from "@/lib/utils";

/**
 * Country flag as a small rounded rectangle (flag-icons SVG sprite).
 * `size` is the flag height in px; width follows the ~4:3 flag aspect.
 */
export function Flag({
  iso,
  code,
  size = 16,
  className,
}: {
  iso?: string;
  code?: string;
  size?: number;
  className?: string;
}) {
  if (!iso) {
    return (
      <span className={cn("inline-block", className)} style={{ fontSize: size }}>
        🏳️
      </span>
    );
  }
  return (
    <span
      className={cn(
        "fi inline-block shrink-0 rounded-[3px] ring-1 ring-black/25",
        `fi-${iso}`,
        className,
      )}
      style={{ fontSize: size, lineHeight: 1 }}
      role="img"
      aria-label={code ?? iso}
      title={code ?? iso}
    />
  );
}
