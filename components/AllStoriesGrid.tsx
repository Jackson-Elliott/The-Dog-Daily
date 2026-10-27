"use client";

import type { Episode } from "@/types/episode";
import { useInPlaceAudio } from "@/lib/useInPlaceAudio";
import StoryCard from "@/components/StoryCard";

/**
 * Archive of every live episode. Desktop is a 3-column grid; stacked
 * layouts stay one column so the list just scrolls. Clicking a card
 * plays that script in place — it never becomes the hero.
 */
export default function AllStoriesGrid({
  episodes,
  fullColour = false,
}: {
  episodes: Episode[];
  fullColour?: boolean;
}) {
  const { togglePlay, currentTime, duration, isPlayingId, isActiveId, audioProps } = useInPlaceAudio(episodes);

  return (
    <>
      <audio {...audioProps} />
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3">
        {episodes.map((episode, index) => (
          <StoryCard
            key={episode.id}
            episode={episode}
            playInPlace
            isPlaying={isPlayingId(episode.id)}
            isActive={isActiveId(episode.id)}
            currentTime={currentTime}
            duration={duration}
            fullColour={fullColour}
            introDelayMs={Math.min(index, 8) * 60}
            onSelect={(id) => togglePlay(id)}
          />
        ))}
      </div>
    </>
  );
}
