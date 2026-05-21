// PLACEHOLDER procedural music.
//
// To replace with a real audio file, swap the PolySynth/Loop block in
// `ensureInit()` with a Tone.Player loading from /sounds/music.mp3 and
// looping. Owner will provide a royalty-free .mp3 (Pixabay or similar)
// after deploy.
//
// All audio routes through Tone.Destination so a single setMusicMuted()
// silences everything (pad, arpeggio, keyboard clicks). Music does not
// restart on scene transitions — startMusic() is idempotent.

import * as Tone from "tone";

type MusicState = {
  pad: Tone.PolySynth;
  arp: Tone.Synth;
  reverb: Tone.Reverb;
  chordLoop: Tone.Loop;
  arpLoop: Tone.Loop;
  noise: Tone.NoiseSynth;
  started: boolean;
};

let state: MusicState | null = null;

/** A minor → F → C → G  (Am-F-C-G, the classic "endlessly hopeful" loop) */
const CHORDS: string[][] = [
  ["A2", "C4", "E4", "A4"],
  ["F2", "A3", "C4", "F4"],
  ["C2", "C4", "E4", "G4"],
  ["G2", "B3", "D4", "G4"],
];

const ARP_NOTES = ["A5", "E5", "G5", "C5", "D5"];

function ensureInit(): MusicState {
  if (state) return state;
  if (typeof window === "undefined") {
    throw new Error("audio-music: ensureInit called on the server");
  }

  // Slow, breathy pad — long attack/release for ambient washes.
  const reverb = new Tone.Reverb({ decay: 4, wet: 0.4 });
  // Reverb requires its impulse response to be generated; await is best,
  // but Tone schedules sound through the AudioContext clock so we can
  // proceed immediately and the buffer will be ready before audible use.
  void reverb.generate();
  reverb.toDestination();

  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 1.5, decay: 0.6, sustain: 0.55, release: 3 },
    volume: -16,
  });
  pad.connect(reverb);

  // Sparse high arpeggio — one note per measure-ish, slightly random.
  const arp = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.04, decay: 0.25, sustain: 0, release: 0.9 },
    volume: -22,
  });
  arp.connect(reverb);

  // Keyboard click — short white-noise burst with hard envelope.
  const noise = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.03 },
    volume: -28,
  });
  noise.toDestination();

  // 70-80 BPM territory. With 1m = 4 beats at 72 BPM that's ~3.33s per
  // chord, ~13.3s per full progression. Close enough to the brief's
  // "8-second loop" goal — what matters is the slow continuous wash.
  Tone.Transport.bpm.value = 72;

  let chordIdx = 0;
  const chordLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(CHORDS[chordIdx % CHORDS.length], "1m", time);
    chordIdx++;
  }, "1m");

  let arpIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    // Roughly 60% chance to play on each beat, so the arpeggio reads as
    // sparse instead of constant.
    if (Math.random() < 0.55) {
      const note = ARP_NOTES[arpIdx % ARP_NOTES.length];
      arp.triggerAttackRelease(note, "8n", time);
    }
    arpIdx++;
  }, "2n");

  state = {
    pad,
    arp,
    reverb,
    chordLoop,
    arpLoop,
    noise,
    started: false,
  };
  return state;
}

/** Start (or no-op if already running) the procedural music. Tone.start()
 *  must have been called from a user-gesture event before invoking this. */
export async function startMusic(): Promise<void> {
  if (typeof window === "undefined") return;
  const s = ensureInit();
  if (s.started) return;

  // Begin loops slightly in the future so the AudioContext stabilises.
  s.chordLoop.start("+0.05");
  s.arpLoop.start("+0.1");
  Tone.Transport.start("+0.05");
  s.started = true;
}

export function stopMusic(): void {
  if (!state) return;
  state.chordLoop.stop();
  state.arpLoop.stop();
  Tone.Transport.stop();
  state.started = false;
}

/** Mute / unmute every Tone-routed source (pad, arpeggio, keyboard click). */
export function setMusicMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  // Touching Tone.getDestination() is safe before any node is constructed.
  Tone.getDestination().mute = muted;
}

/** Volume in dB (default ~ -8). */
export function setMusicVolume(db: number): void {
  if (typeof window === "undefined") return;
  Tone.getDestination().volume.value = db;
}

/** Whether music has been started at least once this session. */
export function isMusicStarted(): boolean {
  return !!state?.started;
}

/** Fire one quick keyboard-click noise burst. Safe to call before music
 *  has started — the synth is created lazily on first init. */
export function playKeyboardClick(): void {
  if (typeof window === "undefined") return;
  const s = ensureInit();
  try {
    s.noise.triggerAttackRelease("32n");
  } catch {
    // Ignore — calling before Tone.start() will silently no-op.
  }
}
