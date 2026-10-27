"use client";

import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react";
import type { Episode } from "@/types/episode";

/**
 * One hidden <audio> that plays whichever story card was clicked, in place.
 * Only one spot plays at a time: any other <audio> starting pauses this one,
 * and this one starting pauses the rest. Spread `audioProps` onto the element.
 */
export function useInPlaceAudio(episodes: Episode[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    function handleOtherPlay(event: Event) {
      if (event.target !== audioRef.current) audioRef.current?.pause();
    }
    document.addEventListener("play", handleOtherPlay, true);
    return () => document.removeEventListener("play", handleOtherPlay, true);
  }, []);

  const togglePlay = useCallback(
    (id: string) => {
      const episode = episodes.find((item) => item.id === id);
      const audioEl = audioRef.current;
      if (!episode || !audioEl) return;

      if (activeId === id) {
        if (audioEl.paused) void audioEl.play().catch(() => {});
        else audioEl.pause();
        return;
      }

      audioEl.pause();
      audioEl.src = episode.audioUrl;
      setActiveId(id);
      setCurrentTime(0);
      setDuration(0);
      void audioEl.play().catch(() => {});
    },
    [episodes, activeId],
  );

  function handlePlay() {
    document.querySelectorAll("audio").forEach((other) => {
      if (other !== audioRef.current) other.pause();
    });
    setIsPlaying(true);
  }

  return {
    togglePlay,
    activeId,
    isPlaying,
    currentTime,
    duration,
    isPlayingId: (id: string) => isPlaying && activeId === id,
    isActiveId: (id: string) => activeId === id,
    audioProps: {
      ref: audioRef,
      preload: "none" as const,
      className: "hidden",
      onPlay: handlePlay,
      onPause: () => setIsPlaying(false),
      onEnded: () => {
        setIsPlaying(false);
        setActiveId(null);
        setCurrentTime(0);
      },
      onTimeUpdate: (event: SyntheticEvent<HTMLAudioElement>) => {
        setCurrentTime(event.currentTarget.currentTime);
      },
      onLoadedMetadata: (event: SyntheticEvent<HTMLAudioElement>) => {
        setDuration(event.currentTarget.duration || 0);
      },
    },
  };
}
