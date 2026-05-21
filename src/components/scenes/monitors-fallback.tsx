// Static CSS-perspective fallback for the 3D monitors when
// prefers-reduced-motion is reduce.

const PANELS = [
  {
    title: "~/creatixreach $",
    lines: [
      "$ pnpm build",
      "Compiled successfully",
      "Route /             10.2 kB",
      "Route /contact       8.1 kB",
      "Deployed to vercel ok",
      "$ █",
    ],
    transform: "perspective(900px) rotateY(18deg) rotateX(-3deg) translateY(-12px)",
  },
  {
    title: "Hero.tsx",
    lines: [
      "export function Hero() {",
      "  return (",
      "    <Scene>",
      "      <Headline>",
      "        We run the whole",
      "        stack.",
      "      </Headline>",
      "    </Scene>",
      "  );",
      "}",
    ],
    transform: "perspective(900px) rotateY(0deg) rotateX(-2deg)",
  },
  {
    title: "call-flow.txt",
    lines: [
      "         CALL FLOW",
      "  ┌────────────┐",
      "  │  Dialer    │",
      "  └─────┬──────┘",
      "        │",
      "  ┌─────▼──────┐",
      "  │   Agent    │",
      "  └─────┬──────┘",
      "        │ qualified",
      "  ┌─────▼──────┐",
      "  │   Lead     │",
      "  └────────────┘",
    ],
    transform: "perspective(900px) rotateY(-18deg) rotateX(-3deg) translateY(-8px)",
  },
];

export function MonitorsFallback({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none flex items-center justify-center gap-4 px-4 sm:gap-8 ${className ?? ""}`}
      aria-hidden="true"
    >
      {PANELS.map((p, i) => (
        <div
          key={i}
          style={{ transform: p.transform }}
          className="hidden w-64 origin-center rounded-lg border border-white/10 bg-slate-950/80 p-3 shadow-2xl shadow-indigo-900/30 sm:block"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] text-indigo-300">{p.title}</span>
            <span className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500/80" />
              <span className="h-2 w-2 rounded-full bg-amber-500/80" />
              <span className="h-2 w-2 rounded-full bg-green-500/80" />
            </span>
          </div>
          <pre className="overflow-hidden whitespace-pre font-mono text-[10px] leading-snug text-slate-300">
            {p.lines.join("\n")}
          </pre>
        </div>
      ))}
    </div>
  );
}
