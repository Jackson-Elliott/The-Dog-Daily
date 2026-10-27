"use client";

import Image from "next/image";
import type { Episode } from "@/types/episode";
import { useInPlaceAudio } from "@/lib/useInPlaceAudio";
import { PlayBadge } from "@/components/SectionStoryCard";
import { ListenLabel, StoryKicker } from "@/components/StoryLabels";
import InlinePlayer from "@/components/InlinePlayer";
import { newspaperArticle, newspaperTeaser } from "@/lib/newspaper-copy";
import { sortByLevel } from "@/lib/levels";
import { CATEGORIES, type Category } from "@/lib/categories";

type PlayProps = {
  isPlaying: boolean;
  isActive: boolean;
  onSelect: (id: string) => void;
  currentTime: number;
  duration: number;
};

function Kicker({ episode }: { episode: Episode }) {
  return <StoryKicker episode={episode} className="mb-2" />;
}

function Listen({ isPlaying }: { isPlaying: boolean }) {
  return <ListenLabel isPlaying={isPlaying} className="mt-3" />;
}

const COLUMN_CLASSES = {
  1: "",
  2: "columns-2 gap-5 [column-rule:1px_solid_#d4d4d4]",
  3: "columns-3 gap-5 [column-rule:1px_solid_#d4d4d4]",
} as const;

function Body({
  episode,
  columns = 1,
  dropCap = false,
}: {
  episode: Episode;
  columns?: keyof typeof COLUMN_CLASSES;
  dropCap?: boolean;
}) {
  return (
    <p
      className={`mt-3 font-serif text-[13px] leading-[1.5] text-neutral-800 text-justify ${COLUMN_CLASSES[columns]} ${
        dropCap
          ? "first-letter:float-left first-letter:mr-1.5 first-letter:mt-1 first-letter:font-[family-name:var(--font-headline)] first-letter:text-[3.4rem] first-letter:font-light first-letter:leading-[0.8] first-letter:text-black"
          : ""
      }`}
    >
      {newspaperArticle(episode)}
    </p>
  );
}

function Photo({ episode, aspect, isPlaying }: { episode: Episode; aspect: string; isPlaying: boolean }) {
  const headline = episode.headline ?? episode.scriptName;
  return (
    <div className={`relative mb-3 w-full overflow-hidden bg-neutral-300 ${aspect}`}>
      {episode.photoUrl ? (
        <Image src={episode.photoUrl} alt={headline} fill unoptimized draggable={false} className="object-cover" />
      ) : null}
      <PlayBadge isPlaying={isPlaying} small={false} />
    </div>
  );
}

/**
 * One newspaper article: optional photo, kicker, headline, optional body
 * copy and a Listen link. The whole article is the play button.
 */
function Article({
  episode,
  isPlaying,
  isActive,
  onSelect,
  currentTime,
  duration,
  headlineClass,
  photoAspect,
  body = false,
  columns = 1,
  dropCap = false,
}: PlayProps & {
  episode: Episode;
  headlineClass: string;
  photoAspect?: string;
  body?: boolean;
  columns?: keyof typeof COLUMN_CLASSES;
  dropCap?: boolean;
}) {
  const headline = episode.headline ?? episode.scriptName;
  return (
    <div className="self-start">
      <button
        type="button"
        aria-label={`${isPlaying ? "Pause" : "Play"} ${headline}`}
        onClick={() => onSelect(episode.id)}
        className="group block w-full text-left"
      >
        {photoAspect ? <Photo episode={episode} aspect={photoAspect} isPlaying={isPlaying} /> : null}
        <Kicker episode={episode} />
        <p className={`text-black decoration-1 underline-offset-4 group-hover:underline ${headlineClass}`}>{headline}</p>
        {body ? <Body episode={episode} columns={columns} dropCap={dropCap} /> : null}
        <Listen isPlaying={isPlaying} />
      </button>
      {isActive ? (
        <InlinePlayer isPlaying={isPlaying} currentTime={currentTime} duration={duration} onToggle={() => onSelect(episode.id)} />
      ) : null}
    </div>
  );
}

const SERIF_LIGHT = "headline-font font-normal tracking-[-0.01em]";
const SERIF_SMALL = "headline-font font-normal leading-snug tracking-[-0.01em]";

/** Remaining stories fill these two rows in turn, four then five at a time. */
function RowA({ stories, play }: { stories: Episode[]; play: (episode: Episode) => PlayProps }) {
  // The centre photo story is this row's biggest slot, so it takes the top-ranked story.
  const [second, first, third, fourth] = stories;
  return (
    <div className="mt-8 grid grid-cols-12 border-t border-black pt-6">
      <div className="col-span-3 pr-6">
        {first ? (
          <Article
            episode={first}
            {...play(first)}
            headlineClass={`${SERIF_LIGHT} text-[1.6875rem] leading-[1.05]`}
            body
            dropCap
          />
        ) : null}
      </div>
      <div className="col-span-6 border-x border-neutral-300 px-6">
        {second ? (
          <Article
            episode={second}
            {...play(second)}
            photoAspect="aspect-[16/9]"
            headlineClass={`${SERIF_LIGHT} text-[2.025rem] leading-[1.05]`}
            body
            columns={2}
          />
        ) : null}
      </div>
      <div className="col-span-3 pl-6">
        {[third, fourth].map((episode, index) =>
          episode ? (
            <div key={episode.id} className={index > 0 ? "mt-5 border-t border-neutral-300 pt-5" : undefined}>
              <Article episode={episode} {...play(episode)} headlineClass={`${SERIF_SMALL} text-base`} body />
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}

function RowB({ stories, play }: { stories: Episode[]; play: (episode: Episode) => PlayProps }) {
  const [first, second, ...briefs] = stories;
  return (
    <div className="mt-8 grid grid-cols-12 border-t border-black pt-6">
      <div className="col-span-6 pr-6">
        {first ? (
          <Article
            episode={first}
            {...play(first)}
            photoAspect="aspect-[16/9]"
            headlineClass={`${SERIF_LIGHT} text-[1.6875rem] leading-[1.05]`}
            body
            columns={2}
            dropCap
          />
        ) : null}
      </div>
      <div className="col-span-3 border-x border-neutral-300 px-6">
        {second ? (
          <Article
            episode={second}
            {...play(second)}
            photoAspect="aspect-[4/3]"
            headlineClass={`${SERIF_SMALL} text-lg`}
            body
          />
        ) : null}
      </div>
      <div className="col-span-3 pl-6">
        {briefs.map((episode, index) => (
          <div key={episode.id} className={index > 0 ? "mt-5 border-t border-neutral-300 pt-5" : undefined}>
            <Article episode={episode} {...play(episode)} headlineClass={`${SERIF_LIGHT} text-xl leading-tight`} />
          </div>
        ))}
      </div>
    </div>
  );
}

const ROW_A_SIZE = 4;
const ROW_B_SIZE = 5;
/** Home: the lead plus two supporting stories, then category sections. */
const HOME_TOP_COUNT = 3;
/** Home category tasters; topic tabs still list every story in the paper layout. */
const HOME_SECTION_LIMIT = 6;

function HomeLead({ stories, play }: { stories: Episode[]; play: (episode: Episode) => PlayProps }) {
  const [lead, ...supporting] = stories;
  if (!lead) return null;
  return (
    <div className="grid grid-cols-12 items-start">
      <div className="col-span-4 border-r border-neutral-300 pr-6">
        {supporting.map((episode, index) => (
          <div key={episode.id} className={index > 0 ? "mt-6 border-t border-neutral-300 pt-6" : undefined}>
            <Article
              episode={episode}
              {...play(episode)}
              headlineClass={
                index === 0 ? `${SERIF_LIGHT} text-[2.34rem] leading-[1.02]` : `${SERIF_LIGHT} text-[1.6875rem] leading-[1.05]`
              }
              body
              dropCap={index === 0}
            />
          </div>
        ))}
      </div>
      <div className="col-span-8 pl-6">
        <button
          type="button"
          aria-label={`${play(lead).isPlaying ? "Pause" : "Play"} ${lead.headline ?? lead.scriptName}`}
          onClick={() => play(lead).onSelect(lead.id)}
          className="group block w-full text-left"
        >
          <Photo episode={lead} aspect="aspect-[16/10]" isPlaying={play(lead).isPlaying} />
          <Kicker episode={lead} />
          <p
            className={`${SERIF_LIGHT} text-[3.06rem] leading-[1] text-black decoration-1 underline-offset-[6px] group-hover:underline`}
          >
            {lead.headline ?? lead.scriptName}
          </p>
          <div className="mt-1">
            <Body episode={lead} columns={3} dropCap />
          </div>
          <Listen isPlaying={play(lead).isPlaying} />
        </button>
        {play(lead).isActive ? (
          <InlinePlayer
            isPlaying={play(lead).isPlaying}
            currentTime={play(lead).currentTime}
            duration={play(lead).duration}
            onToggle={() => play(lead).onSelect(lead.id)}
          />
        ) : null}
      </div>
    </div>
  );
}

function HomeCategorySection({
  title,
  category,
  episodes,
  play,
  onSelectCategory,
}: {
  title: string;
  category?: Category;
  episodes: Episode[];
  play: (episode: Episode) => PlayProps;
  onSelectCategory?: (category: Category) => void;
}) {
  const [lead, ...rest] = episodes;
  const side = rest.slice(0, 2);
  const briefs = rest.slice(2);
  if (!lead) return null;

  const heading = category ? (
    <button
      type="button"
      onClick={() => onSelectCategory?.(category)}
      className="group flex items-center gap-1 text-xs font-bold uppercase tracking-[0.2em] text-black"
    >
      <span className="group-hover:underline">{title}</span>
      <span aria-hidden="true">›</span>
    </button>
  ) : (
    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black">{title}</h2>
  );

  return (
    <section className="mt-8 border-t border-black pt-5">
      {heading}
      <div className="mt-5 grid grid-cols-12">
        <div className={side.length > 0 ? "col-span-7 pr-6" : "col-span-12"}>
          <Article
            episode={lead}
            {...play(lead)}
            photoAspect="aspect-[16/9]"
            headlineClass={`${SERIF_LIGHT} text-[1.6875rem] leading-[1.05]`}
            body
            columns={side.length > 0 ? 1 : 2}
          />
        </div>
        {side.length > 0 ? (
          <div className="col-span-5 border-l border-neutral-300 pl-6">
            {side.map((episode, index) => (
              <div key={episode.id} className={index > 0 ? "mt-5 border-t border-neutral-300 pt-5" : undefined}>
                <Article episode={episode} {...play(episode)} headlineClass={`${SERIF_SMALL} text-lg`} body />
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {briefs.length > 0 ? (
        <div className="mt-6 grid grid-cols-3 gap-x-6 border-t border-neutral-300 pt-5">
          {briefs.map((episode, index) => (
            <div key={episode.id} className={index > 0 ? "border-l border-neutral-300 pl-6" : "pr-6"}>
              <Article episode={episode} {...play(episode)} headlineClass={`${SERIF_LIGHT} text-xl leading-tight`} />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function homeSections(episodes: Episode[]): { title: string; category?: Category; episodes: Episode[] }[] {
  const sections: { title: string; category?: Category; episodes: Episode[] }[] = CATEGORIES.map((category) => ({
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

/**
 * Design 3 (desktop only): a newspaper front page. On Home, a lead plus two
 * supporting stories, then sections for News, Sports, Politics, and the other
 * tabs. Topic tabs keep the mixed paper layout. Body copy comes from
 * lib/newspaper-copy.ts. Clicking any article plays its spot in place.
 */
export default function NewspaperFront({
  episodes,
  home = false,
  onSelectCategory,
}: {
  episodes: Episode[];
  home?: boolean;
  onSelectCategory?: (category: Category) => void;
}) {
  const { togglePlay, currentTime, duration, isPlayingId, isActiveId, audioProps } = useInPlaceAudio(episodes);

  if (episodes.length === 0) return null;

  const play = (episode: Episode): PlayProps => ({
    isPlaying: isPlayingId(episode.id),
    isActive: isActiveId(episode.id),
    onSelect: togglePlay,
    currentTime,
    duration,
  });

  if (home) {
    const ranked = sortByLevel(episodes);
    const top = ranked.slice(0, HOME_TOP_COUNT);
    const used = new Set(top.map((episode) => episode.id));
    const sections = homeSections(ranked.filter((episode) => !used.has(episode.id)));

    return (
      <div className="mx-auto hidden w-full max-w-5xl px-4 pb-12 pt-5 lg:block">
        <audio {...audioProps} />
        <HomeLead stories={top} play={play} />
        {sections.map((section) => (
          <HomeCategorySection
            key={section.title}
            title={section.title}
            category={section.category}
            episodes={section.episodes}
            play={play}
            onSelectCategory={onSelectCategory}
          />
        ))}
      </div>
    );
  }

  // Ranked by level, then handed out biggest slot first: lead, the two big
  // text-only headlines, the photo story, the bold story, then the teasers.
  const [lead, below, left, leftPhoto, belowRight, ...rest] = sortByLevel(episodes);
  const teasers = rest.slice(0, 3);

  const rows: { type: "A" | "B"; stories: Episode[] }[] = [];
  let remaining = rest.slice(3);
  while (remaining.length > 0) {
    const type = rows.length % 2 === 0 ? "A" : "B";
    const size = type === "A" ? ROW_A_SIZE : ROW_B_SIZE;
    rows.push({ type, stories: remaining.slice(0, size) });
    remaining = remaining.slice(size);
  }

  return (
    <div className="mx-auto hidden w-full max-w-5xl px-4 pb-12 pt-5 lg:block">
      <audio {...audioProps} />

      {teasers.length > 0 ? (
        <div className="grid grid-cols-3 border-b border-black pb-5">
          {teasers.map((episode, index) => (
            <div
              key={episode.id}
              className={`${index > 0 ? "border-l border-neutral-300 pl-5" : ""} ${index < 2 ? "pr-5" : ""}`}
            >
              <button
                type="button"
                aria-label={`${isPlayingId(episode.id) ? "Pause" : "Play"} ${episode.headline ?? episode.scriptName}`}
                onClick={() => togglePlay(episode.id)}
                className="group w-full text-left"
              >
                <p className="headline-font text-sm font-medium leading-snug tracking-[-0.01em] text-black group-hover:underline">
                  {episode.headline ?? episode.scriptName}
                </p>
                <p className="mt-1 font-serif text-xs leading-snug text-neutral-700">{newspaperTeaser(episode)}</p>
                <Listen isPlaying={isPlayingId(episode.id)} />
              </button>
              {isActiveId(episode.id) ? (
                <InlinePlayer
                  isPlaying={isPlayingId(episode.id)}
                  currentTime={currentTime}
                  duration={duration}
                  onToggle={() => togglePlay(episode.id)}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-12">
        <div className="col-span-4 border-r border-neutral-300 pr-6">
          {left ? (
            <Article
              episode={left}
              {...play(left)}
              photoAspect="aspect-[4/3]"
              headlineClass={`${SERIF_LIGHT} text-[2.34rem] leading-[1.02]`}
              body
              dropCap
            />
          ) : null}
          {leftPhoto ? (
            <div className="mt-6 border-t border-neutral-300 pt-6">
              <Article
                episode={leftPhoto}
                {...play(leftPhoto)}
                photoAspect="aspect-[4/3]"
                headlineClass={`${SERIF_SMALL} text-base`}
                body
              />
            </div>
          ) : null}
        </div>

        <div className="col-span-8 pl-6">
          <button
            type="button"
            aria-label={`${isPlayingId(lead.id) ? "Pause" : "Play"} ${lead.headline ?? lead.scriptName}`}
            onClick={() => togglePlay(lead.id)}
            className="group block w-full text-left"
          >
            <Photo episode={lead} aspect="aspect-[16/10]" isPlaying={isPlayingId(lead.id)} />
            <Kicker episode={lead} />
            <p
              className={`${SERIF_LIGHT} text-[3.06rem] leading-[1] text-black decoration-1 underline-offset-[6px] group-hover:underline`}
            >
              {lead.headline ?? lead.scriptName}
            </p>
            <div className="mt-1">
              <Body episode={lead} columns={3} dropCap />
            </div>
            <Listen isPlaying={isPlayingId(lead.id)} />
          </button>
          {isActiveId(lead.id) ? (
            <InlinePlayer
              isPlaying={isPlayingId(lead.id)}
              currentTime={currentTime}
              duration={duration}
              onToggle={() => togglePlay(lead.id)}
            />
          ) : null}

          {below || belowRight ? (
            <div className="mt-6 grid grid-cols-8 border-t border-neutral-300 pt-6">
              <div className="col-span-4 pr-6">
                {below ? (
                  <Article
                    episode={below}
                    {...play(below)}
                    headlineClass={`${SERIF_LIGHT} text-[1.35rem] leading-[1.1]`}
                    body
                  />
                ) : null}
              </div>
              <div className="col-span-4 border-l border-neutral-300 pl-6">
                {belowRight ? (
                  <Article
                    episode={belowRight}
                    {...play(belowRight)}
                    photoAspect="aspect-[4/3]"
                    headlineClass={`${SERIF_SMALL} text-lg`}
                    body
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {rows.map((row) =>
        row.type === "A" ? (
          <RowA key={row.stories[0].id} stories={row.stories} play={play} />
        ) : (
          <RowB key={row.stories[0].id} stories={row.stories} play={play} />
        ),
      )}
    </div>
  );
}
