"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  SCENE_3_PORTAL_INTRO,
  SCENE_3_PORTAL_PILLS,
  type PortalPill,
} from "@/lib/scene-content";

const RADIUS = 170; // px from center to pill center on desktop
const SIZE = 480; // px square container on desktop

// Pill positions at 12, 2, 4, 6, 8, 10 o'clock (every 60°, starting from -90°)
const PILL_ANGLES_DEG = [-90, -30, 30, 90, 150, 210];

function angleToXY(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad) * r, y: Math.sin(rad) * r };
}

function CenterIcon() {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative flex h-24 w-24 items-center justify-center"
    >
      {/* pulsing glow — animated via tailwind keyframes inline */}
      <div className="absolute inset-0 animate-portal-pulse rounded-full" />
      <Image
        src="/icon-circle-light.png"
        alt="CreatixReach"
        width={96}
        height={96}
        priority
        className="relative h-24 w-24 select-none"
      />
    </motion.div>
  );
}

function PillCard({ pill, delay = 0 }: { pill: PortalPill; delay?: number }) {
  const Icon = pill.Icon;
  return (
    <motion.a
      href={pill.href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="group relative flex w-[120px] flex-col items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-3 text-center backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:scale-[1.05] hover:border-brand-indigo/60 hover:bg-brand-indigo/15 hover:shadow-[0_0_24px_rgba(79,70,229,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy sm:w-[130px]"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-brand-indigo/15 text-brand-indigo transition-colors group-hover:text-white">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-[12px] font-medium leading-tight text-white">
        {pill.label}
      </div>
      {/* Tooltip on hover — fades in below the pill */}
      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-44 -translate-x-1/2 rounded-md border border-white/10 bg-black/85 px-3 py-2 text-[11px] leading-snug text-brand-muted-dark opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
        {pill.tooltip}
      </div>
    </motion.a>
  );
}

export function RadialPortalShowcase() {
  return (
    <section className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mb-6 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-brand-muted-dark"
      >
        <span className="h-px w-6 bg-white/20" />
        {SCENE_3_PORTAL_INTRO}
      </motion.div>

      {/* Desktop / tablet radial layout */}
      <div className="hidden sm:block">
        <div
          className="relative mx-auto"
          style={{ width: SIZE, height: SIZE }}
        >
          {/* Connecting lines via SVG */}
          <svg
            className="pointer-events-none absolute inset-0"
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            aria-hidden="true"
          >
            {PILL_ANGLES_DEG.map((angle, i) => {
              const { x, y } = angleToXY(angle, RADIUS);
              return (
                <line
                  key={i}
                  x1={SIZE / 2}
                  y1={SIZE / 2}
                  x2={SIZE / 2 + x}
                  y2={SIZE / 2 + y}
                  stroke="rgba(124, 131, 255, 0.22)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
              );
            })}
          </svg>

          {/* Center icon — absolute centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <CenterIcon />
          </div>

          {/* Pills */}
          {SCENE_3_PORTAL_PILLS.map((pill, i) => {
            const angle = PILL_ANGLES_DEG[i];
            const { x, y } = angleToXY(angle, RADIUS);
            return (
              <div
                key={pill.label}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
                }}
              >
                <PillCard pill={pill} delay={0.35 + i * 0.06} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile layout — center icon + 2×3 grid below */}
      <div className="flex flex-col items-center gap-6 sm:hidden">
        <CenterIcon />
        <div className="grid w-full grid-cols-2 gap-3">
          {SCENE_3_PORTAL_PILLS.map((pill, i) => (
            <PillCard key={pill.label} pill={pill} delay={0.3 + i * 0.06} />
          ))}
        </div>
      </div>
    </section>
  );
}
