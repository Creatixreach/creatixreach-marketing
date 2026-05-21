"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { type LucideCard, type SimpleIconCard } from "@/lib/scene-content";

type StripProps<T> = {
  label: string;
  cards: T[];
  /** Index of the strip (for stagger offset). */
  rowDelay?: number;
};

function StripShell({
  label,
  rowDelay = 0,
  children,
}: {
  label: string;
  rowDelay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 + rowDelay, ease: "easeOut" }}
      className="w-full"
    >
      <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-brand-muted-dark">
        <span className="h-px w-6 bg-white/20" />
        {label}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {children}
      </div>
    </motion.div>
  );
}

function CardShell({
  delay = 0,
  children,
}: {
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="group flex h-full flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/[0.05]"
    >
      {children}
    </motion.div>
  );
}

/** Strip of icon cards backed by simpleicons.org slugs (CDN-rendered SVGs). */
export function SimpleIconStrip({ label, cards, rowDelay = 0 }: StripProps<SimpleIconCard>) {
  return (
    <StripShell label={label} rowDelay={rowDelay}>
      {cards.map((c, i) => (
        <CardShell key={c.slug} delay={0.32 + rowDelay + i * 0.05}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
              {/* SVGs from cdn.simpleicons.org are tinted brand-muted-dark
               *  via the /94a3b8 suffix per the brief. */}
              <Image
                src={`https://cdn.simpleicons.org/${c.slug}/94a3b8`}
                alt=""
                width={18}
                height={18}
                unoptimized
              />
            </div>
            <div className="min-w-0 text-[13px] font-medium text-white">
              {c.name}
            </div>
          </div>
          <div className="text-[11px] leading-snug text-brand-muted-dark">
            {c.blurb}
          </div>
        </CardShell>
      ))}
    </StripShell>
  );
}

/** Strip of icon cards backed by Lucide icons. */
export function LucideStrip({ label, cards, rowDelay = 0 }: StripProps<LucideCard>) {
  return (
    <StripShell label={label} rowDelay={rowDelay}>
      {cards.map((c, i) => {
        const Icon = c.Icon;
        return (
          <CardShell key={c.name} delay={0.32 + rowDelay + i * 0.05}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-brand-muted-dark">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 text-[13px] font-medium text-white">
                {c.name}
              </div>
            </div>
            <div className="text-[11px] leading-snug text-brand-muted-dark">
              {c.blurb}
            </div>
          </CardShell>
        );
      })}
    </StripShell>
  );
}
