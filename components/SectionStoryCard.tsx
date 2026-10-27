import Image from "next/image";
import type { Episode } from "@/types/episode";
import { formatEpisodeDate } from "@/lib/format";
import TypesetHeadline from "@/components/TypesetHeadline";
import { ListenLabel, StoryKicker } from "@/components/StoryLabels";
import InlinePlayer from "@/components/InlinePlayer";

export type SectionCardSize = "lead" | "large" | "medium" | "small";

/**
 * Design 2 section card, BBC-style: large and medium cards stack photo,
 * headline, and summary; small cards stack a photo over a headline.
 */
export function PlayBadge({ isPlaying, small }: { isPlaying: boolean; small: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white transition duration-200 group-hover:scale-110 group-hover:bg-black/70 ${
        isPlaying ? "bg-black/70" : "bg-black/40"
      } ${
        small ? "h-8 w-8" : "h-12 w-12"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className={small ? "h-4 w-4" : "h-5 w-5"}>
        {isPlaying ? (
          <>
            <rect x="6" y="5" width="4" height="14" />
            <rect x="14" y="5" width="4" height="14" />
          </>
        ) : (
          <path d="M8 5v14l11-7z" />
        )}
      </svg>
    </span>
  );
}

export default function SectionStoryCard({
  episode,
  size,
  isPlaying,
  isActive = false,
  currentTime = 0,
  duration = 0,
  onSelect,
  showSummary = true,
}: {
  episode: Episode;
  size: SectionCardSize;
  isPlaying: boolean;
  isActive?: boolean;
  currentTime?: number;
  duration?: number;
  onSelect: (id: string) => void;
  showSummary?: boolean;
}) {
  const headline = episode.headline ?? episode.scriptName;
  const label = `${isPlaying ? "Pause" : "Play"} ${headline}`;
  const player = isActive ? (
    <InlinePlayer isPlaying={isPlaying} currentTime={currentTime} duration={duration} onToggle={() => onSelect(episode.id)} />
  ) : null;
  const photo = (
    <>
      {episode.photoUrl ? (
        <Image
          src={episode.photoUrl}
          alt={headline}
          fill
          unoptimized
          draggable={false}
          className="object-cover"
        />
      ) : null}
      <PlayBadge isPlaying={isPlaying} small={size === "small"} />
    </>
  );

  if (size === "small") {
    return (
      <div className="w-full self-start">
        <button
          type="button"
          aria-label={label}
          onClick={() => onSelect(episode.id)}
          className="group block w-full text-left"
        >
          <StoryKicker episode={episode} className="mb-2" />
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-500">{photo}</div>
          <p className="headline-font mt-2 text-base font-[450] leading-snug tracking-[-0.01em] text-black group-hover:underline">
            {headline}
          </p>
          <ListenLabel isPlaying={isPlaying} className="mt-1" />
        </button>
        {player}
        <p className="mt-1 text-xs text-neutral-500">{formatEpisodeDate(episode.airDate)}</p>
      </div>
    );
  }

  const isLead = size === "lead";
  const isLarge = size === "large" || isLead;

  return (
    <div className="w-full self-start">
      <button
        type="button"
        aria-label={label}
        onClick={() => onSelect(episode.id)}
        className="group block w-full text-left"
      >
        <StoryKicker episode={episode} className="mb-2" />
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-500">{photo}</div>
        <p
          className={`headline-font mt-3 font-[450] tracking-[-0.01em] text-black group-hover:underline ${
            isLead ? "text-4xl leading-[1.05]" : isLarge ? "text-3xl leading-[1.08]" : "text-xl leading-snug"
          }`}
        >
          {isLarge ? <TypesetHeadline text={headline} /> : headline}
        </p>
        {showSummary && episode.summary ? (
          <p
            className={`mt-2 text-neutral-700 ${
              isLead ? "text-lg leading-relaxed" : isLarge ? "text-base leading-relaxed" : "text-sm leading-snug"
            }`}
          >
            {episode.summary}
          </p>
        ) : null}
        <ListenLabel isPlaying={isPlaying} className={showSummary && episode.summary && isLarge ? "mt-1" : "mt-2"} />
      </button>
      {player}
      <p className="mt-2 text-xs text-neutral-500">{formatEpisodeDate(episode.airDate)}</p>
    </div>
  );
}
