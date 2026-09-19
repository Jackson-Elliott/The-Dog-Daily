"use client";

import Image from "next/image";
import { useState, type CSSProperties, type MouseEvent, type ReactNode, type RefObject } from "react";
import type { Episode } from "@/types/episode";
import { formatEpisodeDate, truncateHeadline } from "@/lib/format";
import { HERO_SWIPE_GAP_PX, useHeroSwipe } from "@/lib/useHeroSwipe";
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

function HeroCaption({
  episode,
  children,
  onActivate,
}: {
  episode: Episode;
  children?: ReactNode;
  onActivate?: (event: MouseEvent<HTMLDivElement>) => void;
}) {
  const headline = truncateHeadline(episode.headline ?? episode.scriptName, 110);

  return (
    <div className="bg-black/[0.035] px-4 py-4" onClick={onActivate}>
      <p className="text-sm font-bold text-black">{formatEpisodeDate(episode.airDate)}</p>
      <p className="headline-font mt-2 text-[2.12625rem] font-semibold leading-[1.05] text-black sm:text-2xl sm:leading-[1.1] lg:text-3xl">
        <TypesetHeadline text={headline} />
      </p>
      {children}
    </div>
  );
}

/** Neighbor story shown under the current card while a mobile swipe is in flight. */
function HeroPeek({ episode }: { episode: Episode }) {
  return (
    <div>
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-500">
        {episode.photoUrl ? (
          <Image src={episode.photoUrl} alt="" fill unoptimized className="object-cover" />
        ) : null}
      </div>
      <HeroCaption episode={episode}>
        {/* Matches DayNav's row so the incoming card is the same height. */}
        <div className="mt-4 h-10" aria-hidden="true" />
      </HeroCaption>
    </div>
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
 *
 * On the stacked layout (below `lg`), the whole card is a swipe handle: it
 * follows the finger and the neighbor story peeks in from the side.
 */
export default function HeroStory({
  episode,
  afterEpisode,
  beforeEpisode,
  audioRef,
  onPlayingChange,
  onSwipeAfter,
  onSwipeBefore,
  canSwipeAfter = false,
  canSwipeBefore = false,
  children,
}: {
  episode: Episode;
  /** Newer story (Day After) — peeks in when swiping right. */
  afterEpisode?: Episode | null;
  /** Older story (Day Before) — peeks in when swiping left. */
  beforeEpisode?: Episode | null;
  audioRef: RefObject<HTMLAudioElement | null>;
  /** Notifies the parent so it can drive the AudioWave visualiser below. */
  onPlayingChange?: (isPlaying: boolean) => void;
  onSwipeAfter?: () => void;
  onSwipeBefore?: () => void;
  canSwipeAfter?: boolean;
  canSwipeBefore?: boolean;
  /** DayNav (and AudioWave), housed in the tinted caption box under the photo. */
  children?: ReactNode;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const swipe = useHeroSwipe({
    canSwipeAfter,
    canSwipeBefore,
    onSwipeAfter: onSwipeAfter ?? (() => {}),
    onSwipeBefore: onSwipeBefore ?? (() => {}),
  });

  const headline = truncateHeadline(episode.headline ?? episode.scriptName, 110);
  const isSwiping = swipe.isMobile && swipe.phase !== "idle";
  const settleClass = swipe.phase === "settling" ? "hero-swipe-settle" : undefined;

  function togglePlay() {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    if (isPlaying) {
      audioEl.pause();
    } else {
      void audioEl.play();
    }
  }

  function handleCardClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    // Nested Day After/Before handle themselves.
    if (target.closest("button, a")) return;
    // A horizontal swipe still fires a trailing click — ignore that one.
    if (swipe.suppressClick) return;
    togglePlay();
  }

  const currentStyle: CSSProperties | undefined = swipe.isMobile
    ? { transform: `translateX(${swipe.dragX}px)` }
    : undefined;

  return (
    <div ref={swipe.frameRef} className="relative overflow-hidden">
      {swipe.isMobile && afterEpisode ? (
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 ${settleClass ?? ""}`}
          style={{ transform: `translateX(calc(-100% - ${HERO_SWIPE_GAP_PX}px + ${swipe.dragX}px))` }}
          aria-hidden="true"
        >
          <HeroPeek episode={afterEpisode} />
        </div>
      ) : null}

      {swipe.isMobile && beforeEpisode ? (
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 ${settleClass ?? ""}`}
          style={{ transform: `translateX(calc(100% + ${HERO_SWIPE_GAP_PX}px + ${swipe.dragX}px))` }}
          aria-hidden="true"
        >
          <HeroPeek episode={beforeEpisode} />
        </div>
      ) : null}

      <div
        className={`group relative flex cursor-pointer flex-col gap-0 bg-white touch-pan-y ${settleClass ?? ""} ${isSwiping ? "select-none" : ""}`}
        style={currentStyle}
        onClick={handleCardClick}
        onTransitionEnd={(event) => swipe.onTrackTransitionEnd(event)}
        {...swipe.photoHandlers}
      >
        <div
          data-hero-photo=""
          className="relative m-0 block aspect-[16/9] w-full overflow-hidden bg-neutral-500 p-0 leading-none [font-size:0]"
        >
          <audio
            ref={audioRef}
            src={episode.audioUrl}
            preload="metadata"
            className="hidden"
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
              draggable={false}
              className="pointer-events-none object-cover"
            />
          ) : null}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              togglePlay();
            }}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="pointer-events-none absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition group-hover:bg-black/55 sm:h-20 sm:w-20"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>

        <HeroCaption
          episode={episode}
          onActivate={(event) => {
            event.stopPropagation();
            if ((event.target as HTMLElement).closest("button, a")) return;
            if (swipe.suppressClick) return;
            togglePlay();
          }}
        >
          {children}
        </HeroCaption>
      </div>
    </div>
  );
}
