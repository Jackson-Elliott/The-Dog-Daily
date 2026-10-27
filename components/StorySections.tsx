"use client";

import type { Episode } from "@/types/episode";
import { useInPlaceAudio } from "@/lib/useInPlaceAudio";
import { sortByLevel } from "@/lib/levels";
import { CATEGORIES, SUBCATEGORIES, type Category } from "@/lib/categories";
import SectionStoryCard from "@/components/SectionStoryCard";

/** Home sections show a taster of each tab; topic tabs list every story. */
const HOME_SECTION_LIMIT = 7;
/** Lead story plus two stacked beside it, replacing Design 1's hero block. */
const TOP_STORY_COUNT = 3;
const SMALL_PER_ROW = 4;

/**
 * Newspaper-style column rule, drawn in the middle of a gap-x-12 gutter so
 * every column keeps the same width.
 */
function columnRuleClass(index: number): string {
  return index > 0
    ? "relative before:absolute before:inset-y-0 before:-left-6 before:border-l before:border-neutral-300"
    : "";
}

interface Section {
  title: string;
  /** Set on Home, where the heading jumps to that tab. */
  category?: Category;
  episodes: Episode[];
}

function buildSections(episodes: Episode[], activeCategory: Category | null): Section[] {
  if (!activeCategory) {
    const sections: Section[] = CATEGORIES.map((category) => ({
      title: category,
      category,
      episodes: episodes.filter((episode) => episode.category === category).slice(0, HOME_SECTION_LIMIT),
    }));
    sections.push({
      title: "More",
      episodes: episodes
        .filter((episode) => !(CATEGORIES as readonly string[]).includes(episode.category ?? ""))
        .slice(0, HOME_SECTION_LIMIT),
    });
    return sections.filter((section) => section.episodes.length > 0);
  }

  const sections: Section[] = SUBCATEGORIES[activeCategory].map((subcategory) => ({
    title: subcategory,
    episodes: episodes.filter((episode) => episode.subcategory === subcategory),
  }));
  sections.push({ title: "More", episodes: episodes.filter((episode) => !episode.subcategory) });
  return sections.filter((section) => section.episodes.length > 0);
}

/**
 * Design 2 (desktop only): the whole desktop page. A lead story with two
 * stacked beside it, then BBC-style sections. On Home there is one section
 * per tab; on a topic tab, one per sub-topic. Each section leads with a large
 * card, then two medium cards, then a row of small cards. Alternate sections
 * mirror the large card. Stories are ranked by level first, so higher-level
 * stories fill the bigger cards. Clicking any card plays its spot in place.
 */
export default function StorySections({
  episodes,
  activeCategory,
  onSelectCategory,
}: {
  episodes: Episode[];
  activeCategory: Category | null;
  onSelectCategory: (category: Category) => void;
}) {
  const { togglePlay, currentTime, duration, isPlayingId, isActiveId, audioProps } = useInPlaceAudio(episodes);

  const cardPlay = {
    onSelect: togglePlay,
    currentTime,
    duration,
  };

  if (episodes.length === 0) return null;

  const ranked = sortByLevel(episodes);
  const [topLead, ...topSide] = ranked.slice(0, TOP_STORY_COUNT);
  const sections = buildSections(ranked.slice(TOP_STORY_COUNT), activeCategory);

  return (
    <div className="mx-auto hidden w-full max-w-5xl px-4 pb-12 pt-6 lg:block">
      <audio {...audioProps} />

      <div className="grid grid-cols-3 gap-x-12">
        <div className="col-span-2">
          <SectionStoryCard
            episode={topLead}
            size="lead"
            isPlaying={isPlayingId(topLead.id)}
            isActive={isActiveId(topLead.id)}
            {...cardPlay}
          />
        </div>
        <div className={`col-span-1 ${columnRuleClass(1)}`}>
          {topSide.map((episode, index) => (
            <div key={episode.id} className={index > 0 ? "mt-6 border-t border-neutral-300 pt-6" : undefined}>
              <SectionStoryCard
                episode={episode}
                size="medium"
                isPlaying={isPlayingId(episode.id)}
                isActive={isActiveId(episode.id)}
                showSummary={false}
                {...cardPlay}
              />
            </div>
          ))}
        </div>
      </div>

      {sections.map((section, sectionIndex) => {
        const [lead, ...rest] = section.episodes;
        const medium = rest.slice(0, 2);
        const small = rest.slice(2);
        const mirrored = sectionIndex % 2 === 1 && medium.length === 2;

        return (
          <section key={section.title} className="mt-12 border-t border-neutral-300 pt-4">
            {section.category ? (
              <button
                type="button"
                onClick={() => onSelectCategory(section.category as Category)}
                className="headline-font group flex items-center gap-1 text-2xl font-semibold text-black"
              >
                <span className="group-hover:underline">{section.title}</span>
                <span aria-hidden="true" className="text-xl">
                  ›
                </span>
              </button>
            ) : (
              <h2 className="headline-font text-2xl font-semibold text-black">{section.title}</h2>
            )}

            <div className="mt-5 grid grid-cols-4 gap-x-12">
              {(mirrored ? [...medium, lead] : [lead, ...medium]).map((episode, index) => (
                <div
                  key={episode.id}
                  className={`${episode === lead ? "col-span-2" : "col-span-1"} ${columnRuleClass(index)}`}
                >
                  <SectionStoryCard
                    episode={episode}
                    size={episode === lead ? "large" : "medium"}
                    isPlaying={isPlayingId(episode.id)}
                    isActive={isActiveId(episode.id)}
                    {...cardPlay}
                  />
                </div>
              ))}
            </div>

            {small.length > 0 ? (
              <div className="mt-6 grid grid-cols-4 gap-x-12 gap-y-5 border-t border-neutral-300 pt-5">
                {small.map((episode, index) => (
                  <div key={episode.id} className={columnRuleClass(index % SMALL_PER_ROW)}>
                    <SectionStoryCard
                      episode={episode}
                      size="small"
                      isPlaying={isPlayingId(episode.id)}
                      isActive={isActiveId(episode.id)}
                      {...cardPlay}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
