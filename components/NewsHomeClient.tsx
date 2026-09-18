"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Episode } from "@/types/episode";
import SiteHeader from "@/components/SiteHeader";
import StoryCard from "@/components/StoryCard";
import HeroStory from "@/components/HeroStory";
import AudioWave from "@/components/AudioWave";
import DayNav from "@/components/DayNav";
import SiteFooter from "@/components/SiteFooter";

// Keep in sync with the .story-launch animation-duration in app/globals.css —
// the actual hero swap is deferred until the launch animation finishes.
const LAUNCH_DURATION_MS = 380;

// Base delay (ms) before a side thumbnail's .story-card-intro animation starts
// (see app/globals.css) — the "beat" after the hero's own .hero-enter
// animation begins. This is a CSS animation-delay baked in from each card's
// own render, not a JS timer, so it's counted from the moment the browser
// paints that card (same baseline .hero-enter uses) rather than from whenever
// React finishes hydrating — the latter made the initial page load feel
// inconsistently delayed depending on how long hydration took, while
// interaction-driven hero swaps (which don't involve hydration) felt fine.
const STORY_CARD_INTRO_DELAY_MS = 180;
// Extra stagger (ms) between the two cards within a single column.
const INTRO_CARD_STAGGER_MS = 150;

export default function NewsHomeClient({ episodes }: { episodes: Episode[] }) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // Shared with AudioWave so it can attach a Web Audio AnalyserNode to the
  // exact same <audio> element HeroStory plays (see components/AudioWave.tsx).
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // null = "Home" (no filter). See components/SiteHeader.tsx for the tabs.
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Which side the *next* hero should visually enter from — set right before
  // heroIndex changes so the freshly-mounted hero wrapper (see `key={hero.id}`
  // below) plays the matching .hero-enter direction. null = no directional
  // cue (e.g. switching categories).
  const [heroDirection, setHeroDirection] = useState<"left" | "right" | null>(null);
  // The thumbnail currently mid "launch" animation (tapped, but not yet
  // promoted to hero) — see components/StoryCard.tsx.
  const [pendingSelection, setPendingSelection] = useState<{ id: string; side: "left" | "right" } | null>(
    null,
  );
  const launchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (launchTimeoutRef.current) clearTimeout(launchTimeoutRef.current);
    };
  }, []);

  const visibleEpisodes = activeCategory
    ? episodes.filter((episode) => episode.category === activeCategory)
    : episodes;

  function selectCategory(category: string | null) {
    if (launchTimeoutRef.current) clearTimeout(launchTimeoutRef.current);
    setPendingSelection(null);
    setHeroDirection(null);
    setActiveCategory(category);
    setHeroIndex(0);
    setIsPlaying(false);
  }

  if (visibleEpisodes.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader activeCategory={activeCategory} onSelectCategory={selectCategory} />
        <div className="px-4 py-16 text-center text-neutral-500">
          <p>
            {episodes.length === 0
              ? "No episodes yet. Check back soon for the next Dog Daily."
              : "No episodes in this category yet."}
          </p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const hero = visibleEpisodes[heroIndex];
  // The 4 side thumbnails are other episodes in the same filtered list
  // (never the current hero).
  const others = visibleEpisodes.filter((_, index) => index !== heroIndex).slice(0, 4);
  const leftCards = others.slice(0, 2);
  const rightCards = others.slice(2, 4);

  /**
   * Tapping a side thumbnail plays its .story-launch animation in place for
   * LAUNCH_DURATION_MS, then promotes it to hero — which mounts a fresh hero
   * wrapper (`key={hero.id}`) that plays .hero-enter sliding in from the same
   * side the thumbnail launched from, so the motion reads as one continuous
   * "flies into the middle" gesture. Ignored while a launch is already in
   * flight so rapid double-taps can't queue up conflicting transitions.
   */
  function selectEpisode(id: string, side: "left" | "right") {
    if (pendingSelection) return;
    setPendingSelection({ id, side });
    launchTimeoutRef.current = setTimeout(() => {
      const index = visibleEpisodes.findIndex((episode) => episode.id === id);
      if (index !== -1) {
        setHeroDirection(side);
        setHeroIndex(index);
        setIsPlaying(false);
      }
      setPendingSelection(null);
    }, LAUNCH_DURATION_MS);
  }

  function goToDayAfter() {
    if (pendingSelection) return;
    setHeroDirection("right");
    setHeroIndex((index) => Math.max(0, index - 1));
    setIsPlaying(false);
  }

  function goToDayBefore() {
    if (pendingSelection) return;
    setHeroDirection("left");
    setHeroIndex((index) => Math.min(visibleEpisodes.length - 1, index + 1));
    setIsPlaying(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader activeCategory={activeCategory} onSelectCategory={selectCategory} />

      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-[1fr_2fr_1fr]">
          {leftCards.length > 0 ? (
            <div className="hidden lg:block">
              {leftCards.map((episode, index) => (
                <div
                  key={episode.id}
                  className={index > 0 ? "mt-6 border-t border-black pt-6" : undefined}
                >
                  <StoryCard
                    episode={episode}
                    side="left"
                    isLaunching={pendingSelection?.id === episode.id}
                    introDelayMs={STORY_CARD_INTRO_DELAY_MS + index * INTRO_CARD_STAGGER_MS}
                    onSelect={selectEpisode}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="hidden lg:block" />
          )}

          <div>
            {/* Keying this whole block by hero.id (not just HeroStory)
                remounts it fresh on every swap so .hero-enter always
                replays — see the direction comment on heroDirection above. */}
            <div
              key={hero.id}
              style={
                {
                  "--hero-enter-x":
                    heroDirection === "left" ? "-28px" : heroDirection === "right" ? "28px" : "0px",
                } as CSSProperties
              }
              className="hero-enter"
            >
              <HeroStory episode={hero} audioRef={audioRef} onPlayingChange={setIsPlaying}>
                <DayNav
                  onDayAfter={goToDayAfter}
                  onDayBefore={goToDayBefore}
                  disableDayAfter={heroIndex <= 0 || Boolean(pendingSelection)}
                  disableDayBefore={heroIndex >= visibleEpisodes.length - 1 || Boolean(pendingSelection)}
                >
                  <AudioWave key={hero.id} audioRef={audioRef} isPlaying={isPlaying} />
                </DayNav>
              </HeroStory>
            </div>
          </div>

          {rightCards.length > 0 ? (
            <div className="hidden lg:block">
              {rightCards.map((episode, index) => (
                <div
                  key={episode.id}
                  className={index > 0 ? "mt-6 border-t border-black pt-6" : undefined}
                >
                  <StoryCard
                    episode={episode}
                    side="right"
                    isLaunching={pendingSelection?.id === episode.id}
                    introDelayMs={STORY_CARD_INTRO_DELAY_MS + index * INTRO_CARD_STAGGER_MS}
                    onSelect={selectEpisode}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="hidden lg:block" />
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
