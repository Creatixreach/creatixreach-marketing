export function FinalFallback({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none flex h-full w-full items-center justify-center ${className ?? ""}`}
      aria-hidden="true"
    >
      <div className="relative h-48 w-48">
        {/* center diamond */}
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-md bg-brand-indigo/60 shadow-[0_0_60px_rgba(124,131,255,0.6)]" />
        {/* corner service cubes */}
        <div className="absolute -left-4 top-1/2 h-6 w-6 -translate-y-1/2 rounded-sm bg-pink-500/80 shadow-[0_0_20px_rgba(236,72,153,0.6)]" />
        <div className="absolute -right-4 top-1/2 h-6 w-6 -translate-y-1/2 rounded-sm bg-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
        <div className="absolute left-1/2 -top-4 h-6 w-6 -translate-x-1/2 rounded-sm bg-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
        <div className="absolute left-1/2 -bottom-4 h-6 w-6 -translate-x-1/2 rounded-sm bg-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
      </div>
    </div>
  );
}
