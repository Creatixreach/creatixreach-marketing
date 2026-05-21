import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type GlassPanelProps = HTMLAttributes<HTMLDivElement>;

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        style={{ boxShadow: "0 0 40px rgba(79, 70, 229, 0.15), 0 20px 40px rgba(0,0,0,0.45)" }}
        className={cn(
          // base shape + very light blur + very low bg opacity so the scene reads through
          "relative isolate overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-sm",
          // gradient border via ::before mask trick — indigo at higher contrast
          "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:p-px",
          "before:bg-[linear-gradient(140deg,rgba(99,102,241,0.6),rgba(255,255,255,0.1)_45%,rgba(99,102,241,0.25)_100%)]",
          "before:[mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]",
          "before:[-webkit-mask-composite:xor] before:[mask-composite:exclude]",
          // inner top highlight (1px light-catch)
          "after:pointer-events-none after:absolute after:left-4 after:right-4 after:top-px after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent",
          className
        )}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
