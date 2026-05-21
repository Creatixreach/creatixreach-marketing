// Static fallback for Scene 4.

export function SkylineFallback({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none flex h-full w-full items-end justify-center pb-16 ${className ?? ""}`}
      aria-hidden="true"
    >
      <div className="relative h-44 w-[min(90vw,900px)]">
        {/* horizon glow */}
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
        {/* building silhouettes */}
        <div className="absolute inset-x-0 bottom-1 flex items-end justify-center gap-1">
          {[60, 48, 90, 70, 110, 86, 64, 52, 76, 100, 70, 50, 90, 60].map((h, i) => (
            <div
              key={i}
              style={{ height: h }}
              className="w-7 bg-slate-900 shadow-[0_0_18px_rgba(252,211,77,0.18)]"
            />
          ))}
        </div>
        {/* vault */}
        <div className="absolute right-8 bottom-2 h-16 w-24 rounded border border-amber-400/50 bg-amber-500/20 shadow-[0_0_40px_rgba(251,191,36,0.5)]" />
      </div>
    </div>
  );
}
