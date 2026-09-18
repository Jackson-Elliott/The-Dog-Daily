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
  side,
  isLaunching = false,
  introDelayMs = 0,
  onSelect,
}: {
  episode: Episode;
  /** Which column this card renders in — sets which way it "launches" toward the middle. */
  side: "left" | "right";
  /** True for the brief window between tapping a card and it becoming the hero. */
  isLaunching?: boolean;
  /**
   * Delay (ms) before this card's .story-card-intro fade/rise-in animation starts,
   * counted from the moment the card itself is painted/mounted (see
   * components/NewsHomeClient.tsx) — not a JS timer, so it's consistent whether this
   * is the initial page load or a card mounting later (e.g. after switching category).
   */
  introDelayMs?: number;
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
        style={{ "--story-launch-x": `${launchX}px` } as CSSProperties}
        className={`block w-full text-left ${isLaunching ? "story-launch" : ""}`}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-500">
          {episode.photoUrl ? (
            <Image
              src={episode.photoUrl}
              alt={headline}
              fill
              unoptimized
              className="object-cover grayscale transition hover:opacity-90"
            />
          ) : null}
        </div>
        {/* BBC-style caption: sits below the photo (not overlaid on it). */}
        <p className="headline-font mt-2 text-sm font-semibold text-black">
          <TypesetHeadline text={headline} />
        </p>
      </button>
      <p className="mt-1 text-xs text-neutral-500">{formatEpisodeDate(episode.airDate)}</p>
    </div>
  );
}
