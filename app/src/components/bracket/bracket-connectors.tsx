import { useCallback, useEffect, useState, type RefObject } from "react";
import { MATCHES } from "@/lib/tournament-data";

/**
 * SVG overlay that draws bracket "elbow" connectors between each match and its
 * feeder matches. Layout-agnostic: it measures the DOM (elements tagged with
 * `data-mid="<matchId>"`) inside `containerRef` and redraws on resize.
 * Place inside a `position: relative` content box; keep cards above via z-index.
 */
export function BracketConnectors({
  containerRef,
  color = "rgba(46,230,255,0.4)",
  strokeWidth = 1.5,
}: {
  containerRef: RefObject<HTMLElement | null>;
  color?: string;
  strokeWidth?: number;
}) {
  const [paths, setPaths] = useState<string[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const c = container.getBoundingClientRect();
    const box = (id: string) => {
      const el = container.querySelector<HTMLElement>(`[data-mid="${id}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left - c.left, right: r.right - c.left, cy: r.top - c.top + r.height / 2 };
    };

    const next: string[] = [];
    for (const m of MATCHES) {
      const to = box(m.id);
      if (!to) continue;
      for (const slot of [m.a, m.b]) {
        if (!slot.from) continue;
        const from = box(slot.from);
        if (!from) continue;
        if (from.right <= to.left + 1) {
          // feeder on the left → target on the right
          const midX = (from.right + to.left) / 2;
          next.push(`M ${from.right} ${from.cy} H ${midX} V ${to.cy} H ${to.left}`);
        } else if (from.left >= to.right - 1) {
          // feeder on the right → target on the left
          const midX = (to.right + from.left) / 2;
          next.push(`M ${from.left} ${from.cy} H ${midX} V ${to.cy} H ${to.right}`);
        }
      }
    }
    setPaths(next);
    setSize({ w: container.scrollWidth, h: container.scrollHeight });
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    measure();
    // Re-measure after async layout shifts (fonts, flag/trophy images).
    const t = setTimeout(measure, 150);
    const ro = new ResizeObserver(() => measure());
    ro.observe(container);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, containerRef]);

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 z-0"
      width={size.w}
      height={size.h}
      aria-hidden
    >
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      ))}
    </svg>
  );
}
