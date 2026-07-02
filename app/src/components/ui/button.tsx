import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-cyan text-[#03121a] hover:brightness-110 glow-cyan",
        gold: "bg-gold text-[#1c1300] hover:brightness-110 glow-gold",
        outline:
          "border border-border bg-panel/60 text-fg hover:border-cyan/60 hover:text-cyan",
        ghost: "text-muted hover:text-fg hover:bg-panel/60",
        danger: "bg-red/90 text-white hover:bg-red",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
