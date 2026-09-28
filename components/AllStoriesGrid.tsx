"use client";

import { useRef, useState } from "react";
import type { Episode } from "@/types/episode";
import StoryCard from "@/components/StoryCard";

/**
 * Archive of every live episode. Desktop is a 3-column grid; stacked
 * layouts stay one column so the list just scrolls. Clicking a card
 * plays that script in place — it never becomes the hero.
 */
export default function AllStoriesGrid({ episodes }: { episodes: Episode[] }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function togglePlay(id: string) {
    const episode = episodes.find((item) => item.id === id);
    const audioEl = audioRef.current;
    if (!episode || !audioEl) return;

    if (activeId === id) {
      if (audioEl.paused) void audioEl.play();
      else audioEl.pause();
      return;
    }

    audioEl.src = episode.audioUrl;
    setActiveId(id);
    void audioEl.play();
  }

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        className="hidden"
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3">
        {episodes.map((episode, index) => (
          <StoryCard
            key={episode.id}
            episode={episode}
            playInPlace
            isPlaying={activeId === episode.id && isPlaying}
            introDelayMs={Math.min(index, 8) * 60}
            onSelect={togglePlay}
          />
        ))}
      </div>
    </>
  );
}
