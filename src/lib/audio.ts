// Howler-based audio wrapper.
// Sounds live under /public/sounds/. Missing files degrade silently.

import { Howl, Howler } from "howler";

const MUTED_KEY = "cr-marketing-muted";

export type SoundName =
  | "keyboard-loop"
  | "synth-pad"
  | "server-hum"
  | "call-center-ambience"
  | "city-night"
  | "click"
  | "lead-captured"
  | "data-blip";

type SoundEntry = {
  howl: Howl;
  loaded: boolean;
  failed: boolean;
};

const sounds = new Map<string, SoundEntry>();
const warned = new Set<string>();

let unlocked = false;
let muted = false;
let initialized = false;

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    const stored = window.localStorage.getItem(MUTED_KEY);
    muted = stored === "1";
    Howler.mute(muted);
  } catch {
    // localStorage may be unavailable (privacy mode); default to unmuted.
  }
}

function persistMuted() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MUTED_KEY, muted ? "1" : "0");
  } catch {
    // ignore
  }
}

export type LoadOpts = {
  loop?: boolean;
  volume?: number;
  html5?: boolean;
};

export function loadSound(
  name: SoundName,
  src: string,
  opts: LoadOpts = {}
): void {
  ensureInit();
  if (sounds.has(name)) return;
  const entry: SoundEntry = {
    howl: new Howl({
      src: [src],
      loop: opts.loop ?? false,
      volume: opts.volume ?? 0.5,
      html5: opts.html5 ?? false,
      preload: true,
      onload: () => {
        entry.loaded = true;
      },
      onloaderror: () => {
        entry.failed = true;
        if (!warned.has(name)) {
          warned.add(name);
          console.warn(`[audio] sound "${name}" not found at ${src}; silent fallback.`);
        }
      },
      onplayerror: () => {
        entry.failed = true;
      },
    }),
    loaded: false,
    failed: false,
  };
  sounds.set(name, entry);
}

export type PlayOpts = {
  fadeIn?: number;
  volume?: number;
};

export function playSound(name: SoundName, opts: PlayOpts = {}): void {
  ensureInit();
  if (!unlocked || muted) return;
  const entry = sounds.get(name);
  if (!entry || entry.failed) return;
  try {
    const id = entry.howl.play();
    if (typeof opts.volume === "number") entry.howl.volume(opts.volume, id);
    if (opts.fadeIn && opts.fadeIn > 0) {
      const target = opts.volume ?? entry.howl.volume();
      entry.howl.volume(0, id);
      entry.howl.fade(0, target, opts.fadeIn, id);
    }
  } catch {
    // swallow — audio is enhancement, never required
  }
}

export function stopSound(name: SoundName, fadeOut = 0): void {
  const entry = sounds.get(name);
  if (!entry) return;
  try {
    if (fadeOut > 0) {
      const current = entry.howl.volume();
      entry.howl.fade(current, 0, fadeOut);
      window.setTimeout(() => entry.howl.stop(), fadeOut + 20);
    } else {
      entry.howl.stop();
    }
  } catch {
    // ignore
  }
}

export function unlockAudio(): void {
  ensureInit();
  unlocked = true;
  try {
    const ctx = Howler.ctx;
    if (ctx && ctx.state === "suspended") {
      void ctx.resume();
    }
  } catch {
    // ignore
  }
}

export function isUnlocked(): boolean {
  return unlocked;
}

export function setMuted(value: boolean): void {
  ensureInit();
  muted = value;
  Howler.mute(muted);
  persistMuted();
}

export function isMuted(): boolean {
  ensureInit();
  return muted;
}

export function toggleMuted(): boolean {
  setMuted(!muted);
  return muted;
}
