import Image from "next/image";
import type { CSSProperties } from "react";
import type { Episode } from "@/types/episode";
import { formatEpisodeDate } from "@/lib/format";
import TypesetHeadline from "@/components/TypesetHeadline";

/** How far (px) the card slides toward center while launching. */
const LAUNCH_DISTANCE_PX = 18;

/**
 * Clickable thumbnail for a non-hero episode. Selecting one hands its id back
 * to the parent, which (after a brief "launch" animation — see `isLaunching`
 * below and components/NewsHomeClient.tsx) promotes it into the hero/player
 * position. The headline is shown in full (no truncation) — it just wraps
 * onto as many stacked highlight lines as it needs.
 */
export default function StoryCard({
  episode,
  side = "left",
  isLaunching = false,
  introDelayMs = 0,
  playInPlace = false,
  isPlaying = false,
  onSelect,
}: {
  episode: Episode;
  /** Which column this card renders in — sets which way it "launches" toward the middle. */
  side?: "left" | "right";
  /** True for the brief window between tapping a card and it becoming the hero. */
  isLaunching?: boolean;
  /**
   * Delay (ms) before this card's .story-card-intro fade/rise-in animation starts,
   * counted from the moment the card itself is painted/mounted (see
   * components/NewsHomeClient.tsx) — not a JS timer, so it's consistent whether this
   * is the initial page load or a card mounting later (e.g. after switching category).
   */
  introDelayMs?: number;
  /** On All, click plays audio here instead of promoting the card to the hero. */
  playInPlace?: boolean;
  isPlaying?: boolean;
  onSelect: (id: string, side: "left" | "right") => void;
}) {
  const headline = episode.headline ?? episode.scriptName;
  const launchX = side === "left" ? LAUNCH_DISTANCE_PX : -LAUNCH_DISTANCE_PX;

  return (
    <div className="story-card-intro" style={{ animationDelay: `${introDelayMs}ms` }}>
      <button
        type="button"
        onClick={() => onSelect(episode.id, side)}
        disabled={isLaunching}
        aria-label={playInPlace ? `${isPlaying ? "Pause" : "Play"} ${headline}` : undefined}
        style={{ "--story-launch-x": `${launchX}px` } as CSSProperties}
        className={`group block w-full text-left ${isLaunching ? "story-launch" : ""}`}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-500">
          {episode.photoUrl ? (
            <Image
              src={episode.photoUrl}
              alt={headline}
              fill
              unoptimized
              draggable={false}
              className={
                playInPlace
                  ? `object-cover transition-[filter] duration-300 ${
                      isPlaying
                        ? "grayscale-0"
                        : "lg:grayscale lg:group-hover:grayscale-0"
                    }`
                  : "object-cover grayscale transition hover:opacity-90"
              }
            />
          ) : null}
          {playInPlace ? (
            <span
              className="pointer-events-none absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white"
              aria-hidden="true"
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <rect x="6" y="5" width="4" height="14" />
                  <rect x="14" y="5" width="4" height="14" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </span>
          ) : null}
        </div>
        {/* BBC-style caption: sits below the photo (not overlaid on it). */}
        <p
          className={`headline-font mt-2 font-semibold text-black ${
            playInPlace ? "text-[1.09375rem] lg:text-sm" : "text-sm"
          }`}
        >
          <TypesetHeadline text={headline} />
        </p>
      </button>
      <p className="mt-1 text-xs text-neutral-500">{formatEpisodeDate(episode.airDate)}</p>
    </div>
  );
}
