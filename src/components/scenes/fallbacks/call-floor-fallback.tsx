// Static fallback for Scene 3.

export function CallFloorFallback({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none flex h-full w-full items-center justify-center ${className ?? ""}`}
      aria-hidden="true"
    >
      <div className="relative h-72 w-[min(80vw,720px)]">
        {/* horizon twilight band */}
        <div className="absolute inset-x-0 top-1/3 h-1 bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
        {/* globe */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="h-40 w-40 rounded-full border border-indigo-400/40 shadow-[0_0_60px_rgba(124,131,255,0.35)]"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent 0 18px, rgba(124,131,255,0.15) 18px 19px), repeating-linear-gradient(90deg, transparent 0 18px, rgba(124,131,255,0.15) 18px 19px)",
            }}
          />
        </div>
        {/* agent stations row */}
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-10 rounded-sm border border-amber-400/30 bg-amber-500/15 shadow-[0_0_18px_rgba(251,191,36,0.35)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
