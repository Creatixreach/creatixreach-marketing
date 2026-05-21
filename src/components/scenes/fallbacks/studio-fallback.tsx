// Static CSS-perspective fallback for Scene 1 when prefers-reduced-motion.

export function StudioFallback({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none flex h-full w-full items-center justify-center ${className ?? ""}`}
      aria-hidden="true"
    >
      <div
        className="relative h-64 w-[min(80vw,800px)]"
        style={{ perspective: 1000 }}
      >
        <div
          className="absolute left-0 top-2 h-44 w-64 rounded-lg border border-pink-400/30 bg-pink-500/10 shadow-[0_0_40px_rgba(236,72,153,0.25)]"
          style={{ transform: "rotateY(28deg) translateZ(20px)" }}
        />
        <div
          className="absolute left-1/2 top-0 -ml-32 h-48 w-64 rounded-lg border border-purple-400/30 bg-purple-500/10 shadow-[0_0_40px_rgba(168,85,247,0.25)]"
        />
        <div
          className="absolute right-0 top-2 h-44 w-64 rounded-lg border border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.25)]"
          style={{ transform: "rotateY(-28deg) translateZ(20px)" }}
        />
      </div>
    </div>
  );
}
