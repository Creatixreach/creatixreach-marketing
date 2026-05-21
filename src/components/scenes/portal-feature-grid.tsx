"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { CtaButton } from "@/components/ui/cta-button";
import {
  SCENE_3_PORTAL_INTRO,
  SCENE_3_PORTAL_HREF,
  SCENE_3_PORTAL_CTA_LABEL,
  SCENE_3_PORTAL_FEATURES,
  type PortalFeature,
} from "@/lib/scene-content";

function CenterIcon() {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24"
    >
      <div className="absolute inset-0 animate-portal-pulse rounded-full" />
      <Image
        src="/icon-circle-light.png"
        alt="CreatixReach"
        width={96}
        height={96}
        priority
        className="relative h-full w-full select-none"
      />
    </motion.div>
  );
}

function FeatureCard({
  feature,
  delay = 0,
}: {
  feature: PortalFeature;
  delay?: number;
}) {
  const Icon = feature.Icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <GlassPanel className="h-full p-5">
        <div className="flex h-6 w-6 items-center justify-center text-brand-indigo">
          <Icon className="h-6 w-6" />
        </div>
        <div className="mt-3 text-sm font-semibold text-brand-text-dark">
          {feature.name}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-brand-muted-dark">
          {feature.description}
        </p>
      </GlassPanel>
    </motion.div>
  );
}

export function PortalFeatureGrid() {
  return (
    <section className="flex w-full flex-col items-center">
      <CenterIcon />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="mt-4 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-brand-muted-dark"
      >
        <span className="h-px w-6 bg-white/20" />
        {SCENE_3_PORTAL_INTRO}
        <span className="h-px w-6 bg-white/20" />
      </motion.div>

      <div className="mt-8 grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SCENE_3_PORTAL_FEATURES.map((feature, i) => (
          <FeatureCard
            key={feature.name}
            feature={feature}
            delay={0.3 + i * 0.06}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.85, ease: "easeOut" }}
        className="mt-8"
      >
        <CtaButton variant="ghost" href={SCENE_3_PORTAL_HREF} external>
          {SCENE_3_PORTAL_CTA_LABEL}
          <ArrowUpRight className="h-4 w-4" />
        </CtaButton>
      </motion.div>
    </section>
  );
}
