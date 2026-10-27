/** Story levels, biggest first. Set in admin; Designs 2 and 3 size stories by it. */
export const STORY_LEVELS = ["hero", "major", "standard", "brief"] as const;

export type StoryLevel = (typeof STORY_LEVELS)[number];

export const DEFAULT_STORY_LEVEL: StoryLevel = "standard";

export const STORY_LEVEL_LABELS: Record<StoryLevel, string> = {
  hero: "Hero",
  major: "Major",
  standard: "Standard",
  brief: "Brief",
};

export function normalizeStoryLevel(value: unknown): StoryLevel {
  return (STORY_LEVELS as readonly unknown[]).includes(value) ? (value as StoryLevel) : DEFAULT_STORY_LEVEL;
}

/**
 * Highest level first. Array sort is stable, so stories keep their incoming
 * (newest-first) order within a level.
 */
export function sortByLevel<T extends { level: StoryLevel }>(stories: T[]): T[] {
  return [...stories].sort((a, b) => STORY_LEVELS.indexOf(a.level) - STORY_LEVELS.indexOf(b.level));
}
