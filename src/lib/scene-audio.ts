// Centralized declaration of the one-shot SFX each scene can fire through
// Howler. Files may not exist yet — the audio layer logs a single warn and
// silently no-ops. Continuous ambient music lives in audio-music.ts (Tone).

import { loadSound, type SoundName } from "@/lib/audio";

type SlotConfig = {
  name: SoundName;
  src: string;
  loop?: boolean;
  volume?: number;
};

const SLOTS: SlotConfig[] = [
  { name: "click", src: "/sounds/click.mp3", loop: false, volume: 0.4 },
  { name: "lead-captured", src: "/sounds/lead-captured.mp3", loop: false, volume: 0.5 },
  { name: "data-blip", src: "/sounds/data-blip.mp3", loop: false, volume: 0.4 },
];

let registered = false;

export function registerSceneAudio() {
  if (registered) return;
  registered = true;
  for (const slot of SLOTS) {
    loadSound(slot.name, slot.src, {
      loop: slot.loop,
      volume: slot.volume,
      html5: slot.loop === true, // streaming for long loops
    });
  }
}
