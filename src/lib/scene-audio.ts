// Centralized declaration of the sound files each scene wants.
// Files may not exist yet — the audio layer logs a single warn and silently no-ops.

import { loadSound, type SoundName } from "@/lib/audio";

type SlotConfig = {
  name: SoundName;
  src: string;
  loop?: boolean;
  volume?: number;
};

const SLOTS: SlotConfig[] = [
  { name: "keyboard-loop", src: "/sounds/keyboard-loop.mp3", loop: true, volume: 0.35 },
  { name: "synth-pad", src: "/sounds/synth-pad.mp3", loop: true, volume: 0.25 },
  { name: "server-hum", src: "/sounds/server-hum.mp3", loop: true, volume: 0.3 },
  { name: "call-center-ambience", src: "/sounds/call-center-ambience.mp3", loop: true, volume: 0.3 },
  { name: "city-night", src: "/sounds/city-night.mp3", loop: true, volume: 0.3 },
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
