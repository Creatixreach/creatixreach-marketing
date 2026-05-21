// Static fallback for Scene 2 — reduced motion.

export function CorridorFallback({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none flex h-full w-full items-center justify-center ${className ?? ""}`}
      aria-hidden="true"
    >
      <div className="relative h-72 w-[min(80vw,720px)]" style={{ perspective: 1200 }}>
        {/* left rack */}
        <div
          className="absolute left-0 top-1/2 h-56 w-16 -translate-y-1/2 rounded border border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
          style={{ transform: "rotateY(40deg)" }}
        />
        {/* right rack */}
        <div
          className="absolute right-0 top-1/2 h-56 w-16 -translate-y-1/2 rounded border border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
          style={{ transform: "rotateY(-40deg)" }}
        />
        {/* dashboard */}
        <div className="absolute left-1/2 top-1/2 h-44 w-72 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-cyan-300/40 bg-cyan-500/5 p-4 text-cyan-200 shadow-[0_0_60px_rgba(34,211,238,0.4)]">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">API Operations</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>REQ/S 248</div>
            <div>p95 64ms</div>
            <div>QUEUE 3</div>
            <div>ERROR 0.02%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
