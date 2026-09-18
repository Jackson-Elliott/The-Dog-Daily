"use client";

import Image from "next/image";
import { useState, type ReactNode, type RefObject } from "react";
import type { Episode } from "@/types/episode";
import { formatEpisodeDate, truncateHeadline } from "@/lib/format";
import TypesetHeadline from "@/components/TypesetHeadline";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" />
      <rect x="14" y="5" width="4" height="14" />
    </svg>
  );
}

/**
 * The main "story" card: the currently selected episode's photo, a play/pause
 * button, and its headline caption. Playback progress is shown via the
 * AudioWave visualiser rendered below this component (see
 * components/NewsHomeClient.tsx), not a seek bar. `audioRef` is owned by the
 * parent (not created here) so AudioWave can attach a Web Audio
 * AnalyserNode to the exact same <audio> element and visualise the real
 * signal. Render this keyed by `episode.id` so its play state always starts
 * fresh when a different episode is chosen.
 */
export default function HeroStory({
  episode,
  audioRef,
  onPlayingChange,
  children,
}: {
  episode: Episode;
  audioRef: RefObject<HTMLAudioElement | null>;
  /** Notifies the parent so it can drive the AudioWave visualiser below. */
  onPlayingChange?: (isPlaying: boolean) => void;
  /** DayNav (and AudioWave), housed in the tinted caption box under the photo. */
  children?: ReactNode;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const headline = truncateHeadline(episode.headline ?? episode.scriptName, 110);

  function togglePlay() {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    if (isPlaying) {
      audioEl.pause();
    } else {
      void audioEl.play();
    }
  }

  return (
    <div>
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-500">
        <audio
          ref={audioRef}
          src={episode.audioUrl}
          preload="metadata"
          // Lets AudioWave's Web Audio AnalyserNode read real signal data even
          // if audioUrl ends up cross-origin (e.g. Supabase Storage) instead
          // of silently getting zeroed-out ("tainted") frequency data.
          crossOrigin="anonymous"
          onPlay={() => {
            setIsPlaying(true);
            onPlayingChange?.(true);
          }}
          onPause={() => {
            setIsPlaying(false);
            onPlayingChange?.(false);
          }}
          onEnded={() => {
            setIsPlaying(false);
            onPlayingChange?.(false);
          }}
        />

        {episode.photoUrl ? (
          <Image
            src={episode.photoUrl}
            alt={headline}
            fill
            unoptimized
            priority
            className="object-cover"
          />
        ) : null}

        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/55 sm:h-20 sm:w-20"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>

      <div className="bg-black/[0.035] px-4 py-4">
        <p className="text-sm font-bold text-black">{formatEpisodeDate(episode.airDate)}</p>

        {/* BBC-style caption: sits below the photo (not overlaid on it). */}
        <p className="headline-font mt-2 text-[2.12625rem] font-semibold leading-[1.05] text-black sm:text-2xl sm:leading-[1.1] lg:text-3xl">
          <TypesetHeadline text={headline} />
        </p>
        {children}
      </div>
    </div>
  );
}
