import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  /** When false, backdrop click + Esc don't close (only the X). Default true. */
  dismissable?: boolean;
}

/** Lightweight modal (no radix): overlay + centered panel; closes on Esc/backdrop when dismissable. */
export function Modal({ open, onClose, title, children, className, dismissable = true }: ModalProps) {
  useEffect(() => {
    if (!open || !dismissable) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismissable, onClose]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismissable ? onClose : undefined}
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl border border-border bg-panel p-6 shadow-2xl",
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-fg">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted transition-colors hover:bg-panel-2 hover:text-fg"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
