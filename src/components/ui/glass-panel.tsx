import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type GlassPanelProps = HTMLAttributes<HTMLDivElement>;

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl",
          className
        )}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
