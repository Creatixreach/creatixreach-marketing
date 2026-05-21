"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useScene } from "@/components/scenes/scene-controller";
import { Scene0Hero } from "@/components/scenes/scene-0-hero";
import { Scene1WebSocial } from "@/components/scenes/scene-1-web-social";
import { Scene2Systems } from "@/components/scenes/scene-2-systems";
import { Scene3Dialer } from "@/components/scenes/scene-3-dialer";
import { Scene4ColdCalling } from "@/components/scenes/scene-4-cold-calling";
import { Scene5Final } from "@/components/scenes/scene-5-final";

const SCENES = [
  Scene0Hero,
  Scene1WebSocial,
  Scene2Systems,
  Scene3Dialer,
  Scene4ColdCalling,
  Scene5Final,
];

export function SceneStage() {
  const { currentScene } = useScene();
  const Current = SCENES[currentScene] ?? Scene0Hero;

  return (
    // Mobile: inline block in normal page flow (page scrolls).
    // Desktop: fixed full viewport, no page scroll.
    <div className="relative w-full bg-brand-navy md:fixed md:inset-0 md:overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          className="relative w-full md:absolute md:inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Current />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
