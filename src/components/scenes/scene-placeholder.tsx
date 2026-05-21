import { GlassPanel } from "@/components/ui/glass-panel";

export function ScenePlaceholder({
  index,
  title,
  phase,
}: {
  index: number;
  title: string;
  phase: "Phase 3" | "Phase 4";
}) {
  const pill = `${(index + 1).toString().padStart(2, "0")} / 06`;
  return (
    <section className="relative h-full w-full overflow-hidden bg-brand-navy text-brand-text-dark">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(79,70,229,0.18),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(37,99,235,0.12),transparent_50%)]"
      />
      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <GlassPanel className="w-full max-w-xl p-8 text-center sm:p-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-brand-muted-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-indigo" />
            {pill}
          </div>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Scene {index} — {title}
          </h2>
          <p className="mt-4 text-sm uppercase tracking-[0.25em] text-brand-muted-dark">
            coming in {phase}
          </p>
        </GlassPanel>
      </div>
    </section>
  );
}
