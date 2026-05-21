import { Logo } from "@/components/branding/logo";

export function InitialLoader() {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-navy text-brand-text-dark">
      <div className="flex flex-col items-center gap-4">
        <Logo size="md" />
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-muted-dark">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-indigo" />
          loading
        </div>
      </div>
    </div>
  );
}
