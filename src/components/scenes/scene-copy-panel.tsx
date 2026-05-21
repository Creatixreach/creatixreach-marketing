"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { CtaButton } from "@/components/ui/cta-button";
import { WhatsappIcon } from "@/components/ui/whatsapp-icon";
import { SceneNavHint } from "@/components/scenes/scene-nav-hint";
import { whatsappUrl, type CtaTopic } from "@/lib/cta-messages";

export type SceneCopyPanelProps = {
  /** Scene index (0-based). Drives the pill counter "NN / 06". */
  index: number;
  totalScenes?: number;
  /** Optional flag label above the title (e.g. "Our flagship product"). */
  flag?: string;
  title: string;
  sub: string;
  bullets: string[];
  /** WhatsApp prefill key + send-brief topic. */
  topic: CtaTopic;
  /** Extra micro-link rendered below the CTAs (e.g. dialer portal). */
  extraLink?: { label: string; href: string; external?: boolean };
  /** Accent dot color for the index pill + bullet dots. */
  accent?: string;
  /** Override extra classes on the GlassPanel container. */
  panelClassName?: string;
  /** Optional content rendered inside the panel above the flag (e.g. a small icon row). */
  topSlot?: ReactNode;
};

function formatIndex(n: number) {
  return (n + 1).toString().padStart(2, "0");
}

export function SceneCopyPanel({
  index,
  totalScenes = 6,
  flag,
  title,
  sub,
  bullets,
  topic,
  extraLink,
  accent = "bg-brand-indigo",
  panelClassName = "w-full max-w-[520px] p-6 sm:p-8",
  topSlot,
}: SceneCopyPanelProps) {
  return (
    <GlassPanel className={panelClassName}>
      {topSlot}

      {flag && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-white/80"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${accent}`} />
          {flag}
        </motion.div>
      )}

      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-brand-muted-dark">
        <span className={`h-1.5 w-1.5 rounded-full ${accent}`} />
        {formatIndex(index)} / {formatIndex(totalScenes - 1)}
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="mt-3 text-balance text-base text-brand-muted-dark sm:text-lg"
      >
        {sub}
      </motion.p>

      <ul className="mt-5 space-y-2">
        {bullets.map((b, i) => (
          <motion.li
            key={b}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.3 + i * 0.12,
              ease: "easeOut",
            }}
            className="flex items-start gap-3 text-sm text-white/90 sm:text-[15px]"
          >
            <span className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${accent}`} />
            <span>{b}</span>
          </motion.li>
        ))}
      </ul>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.75, ease: "easeOut" }}
        className="mt-7 flex flex-col gap-3 sm:flex-row"
      >
        <CtaButton variant="whatsapp" href={whatsappUrl(topic)} external>
          <WhatsappIcon className="h-4 w-4" />
          WhatsApp Now
        </CtaButton>
        <CtaButton variant="primary" href={`/contact?topic=${topic}`}>
          Send Brief
          <ArrowRight className="h-4 w-4" />
        </CtaButton>
      </motion.div>

      {extraLink && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.95, ease: "easeOut" }}
          className="mt-4 text-xs text-brand-muted-dark"
        >
          {extraLink.external ? (
            <a
              href={extraLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              {extraLink.label}
              <ArrowRight className="h-3 w-3" />
            </a>
          ) : (
            <a
              href={extraLink.href}
              className="inline-flex items-center gap-1 text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              {extraLink.label}
              <ArrowRight className="h-3 w-3" />
            </a>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.05, ease: "easeOut" }}
        className="mt-5 hidden md:block"
      >
        <SceneNavHint />
      </motion.div>
    </GlassPanel>
  );
}
