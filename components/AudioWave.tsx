"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

// Resting bar heights (px), used both as the max height each bar scales up
// to when it's loud and (via MIN_SCALE below) its floor during quiet
// moments. Shaped as a gentle rolling wave — two soft "humps" — rather than
// a jagged random sequence, so it still reads as a deliberate waveform even
// before any audio data comes in. Fewer, slightly fatter bars than the
// previous 36-bar version so it reads as a cleaner wave rather than a dense
// hairline grid. Bars are kept thin (1.5px) so the wave reads as linework
// rather than chunky blocks. Fixed rather than random so there's no hydration mismatch.
const BASE_HEIGHTS = [8, 10, 16, 23, 29, 30, 26, 20, 13, 9, 9, 13, 20, 26, 30, 29, 23, 16, 10, 8];

// Floor scale applied to every bar while playing, so quiet passages still
// read as a calm, full-height-ish wave rather than flattening to near-
// invisible slivers.
const MIN_SCALE = 0.32;

// Raw analyser levels arrive as a 0-1 average that's fairly conservative for
// typical speech — most of a spoken-word episode barely nudges it. Applying
// an exponent < 1 lifts quiet/medium moments disproportionately (loud
// moments still cap at 1), then GAIN pushes the whole curve up further, so
// the wave visibly reacts to normal speech volume instead of only spiking
// on the loudest peaks.
const SENSITIVITY_EXPONENT = 0.6;
const SENSITIVITY_GAIN = 1.35;

type WebkitWindow = typeof window & { webkitAudioContext?: typeof AudioContext };

// AudioContext.createMediaElementSource() can only ever be called ONCE per
// <audio> DOM element for that element's entire lifetime — calling it again,
// even against a different AudioContext, throws. React's Strict Mode
// deliberately double-invokes effects on mount in development (mount ->
// cleanup -> mount again) without actually recreating the underlying DOM
// node, so without this cache the *second* invocation would try to source
// the same real <audio> element again, fail, and leave it permanently
// silent (its one-and-only audio route already led to the first, now-closed
// AudioContext from the synthetic cleanup) — even though play/pause state
// looks completely normal. Caching by the element itself (not by episode)
// makes the second Strict Mode invocation reuse the exact same graph instead
// of trying to create a doomed second one. A real episode swap always gets a
// genuinely new <audio> element (see the `key={hero.id}` in
// NewsHomeClient), so this only ever matters for Strict Mode's synthetic
// remount, not real playback transitions.
const audioGraphCache = new WeakMap<HTMLAudioElement, { context: AudioContext; analyser: AnalyserNode }>();

/**
 * Small bouncing-bar visualiser rendered as the centered `children` of
 * DayNav, sitting between the Day After / Day Before buttons on the same
 * row. Unlike a purely decorative CSS loop, this reads real frequency data
 * off the same <audio> element HeroStory plays (via a Web Audio
 * AnalyserNode), so the bars actually reflect what's coming out of the
 * speakers. Always rendered (so the buttons don't shift) but only becomes
 * visible while the episode is playing.
 *
 * Render this keyed by episode id (see NewsHomeClient) so it builds a fresh
 * Web Audio graph against the new <audio> element each time the hero episode
 * changes (see audioGraphCache below for why the old graph isn't explicitly
 * torn down when that happens).
 */
export default function AudioWave({
  audioRef,
  isPlaying,
}: {
  audioRef: RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
}) {
  const [levels, setLevels] = useState<number[]>(() => BASE_HEIGHTS.map(() => 0));
  const audioContextRef = useRef<AudioContext | null>(null);

  // Build the Web Audio graph (source -> analyser -> destination) once per
  // <audio> element (see audioGraphCache above).
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const cached = audioGraphCache.get(audioEl);
    let audioContext: AudioContext;
    let analyser: AnalyserNode;

    if (cached) {
      ({ context: audioContext, analyser } = cached);
    } else {
      const AudioContextClass = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
      if (!AudioContextClass) return;

      audioContext = new AudioContextClass();
      analyser = audioContext.createAnalyser();
      // 256 (rather than 128) gives 128 frequency bins — enough to spread
      // meaningfully across BASE_HEIGHTS' bars instead of leaving most of
      // them mapped to a single, unaveraged bin.
      analyser.fftSize = 256;
      // Lower than the analyser default (0.8) so bars react promptly to each
      // new frame rather than lagging behind a heavily-smoothed running
      // average — part of the overall sensitivity boost alongside the
      // SENSITIVITY_* curve below.
      analyser.smoothingTimeConstant = 0.55;

      let source: MediaElementAudioSourceNode;
      try {
        source = audioContext.createMediaElementSource(audioEl);
      } catch {
        // Genuinely already sourced by something else — bail quietly rather
        // than throwing and breaking playback.
        void audioContext.close();
        return;
      }
      // Routing playback through the analyser is required to read its data;
      // it must still reach the speakers via .connect(destination).
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      audioGraphCache.set(audioEl, { context: audioContext, analyser });
    }

    audioContextRef.current = audioContext;

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    const bucketSize = Math.max(1, Math.floor(frequencyData.length / BASE_HEIGHTS.length));
    let rafId: number;

    function tick() {
      analyser.getByteFrequencyData(frequencyData);
      const nextLevels = BASE_HEIGHTS.map((_, index) => {
        const start = index * bucketSize;
        const end = Math.min(start + bucketSize, frequencyData.length);
        let sum = 0;
        for (let i = start; i < end; i += 1) sum += frequencyData[i];
        const raw = end > start ? sum / (end - start) / 255 : 0;
        return Math.min(1, Math.pow(raw, SENSITIVITY_EXPONENT) * SENSITIVITY_GAIN);
      });
      setLevels(nextLevels);
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      audioContextRef.current = null;
      // Deliberately don't disconnect/close the graph here — it's cached
      // per-element above specifically so it can survive Strict Mode's
      // synthetic cleanup-then-remount and still be usable afterwards. On a
      // genuine episode swap the old <audio> element (and everything wired
      // to it) simply becomes unreachable and is garbage collected once
      // nothing references it anymore.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- audioRef itself is a stable ref object
  }, []);

  // Browsers suspend new AudioContexts until a user gesture. The play click
  // that flips isPlaying to true is that gesture, so resume alongside it.
  useEffect(() => {
    if (isPlaying) void audioContextRef.current?.resume();
  }, [isPlaying]);

  return (
    <div
      aria-hidden="true"
      className={`flex h-8 shrink-0 items-center justify-center gap-[2px] transition-opacity duration-300 ${
        isPlaying ? "opacity-100" : "opacity-0"
      }`}
    >
      {BASE_HEIGHTS.map((baseHeight, index) => {
        const scale = isPlaying ? Math.max(MIN_SCALE, levels[index] ?? 0) : MIN_SCALE;
        return (
          <span
            key={index}
            className="w-[1.5px] rounded-full bg-black transition-transform duration-100 ease-out"
            style={{ height: baseHeight, transform: `scaleY(${scale})` }}
          />
        );
      })}
    </div>
  );
}
