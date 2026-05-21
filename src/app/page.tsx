"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { SceneController } from "@/components/scenes/scene-controller";
import { SiteChrome } from "@/components/nav/site-chrome";
import { AudioGate } from "@/components/ui/audio-gate";
import { InitialLoader } from "@/components/scenes/initial-loader";

// Stage holds the Three.js Canvas inside Scene 0 — keep it client-only.
const SceneStage = dynamic(
  () => import("@/components/scenes/scene-stage").then((m) => m.SceneStage),
  { ssr: false, loading: () => <InitialLoader /> }
);

export default function HomePage() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <main
      className="relative w-screen bg-brand-navy text-brand-text-dark md:h-screen md:overflow-hidden"
      style={{ touchAction: "pan-y" }}
    >
      {!ready && <InitialLoader />}
      <SceneController>
        <SceneStage />
        <SiteChrome />
        <AudioGate />
      </SceneController>
    </main>
  );
}
