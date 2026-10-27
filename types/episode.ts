import type { StoryLevel } from "@/lib/levels";

export interface Episode {
  id: string;
  scriptName: string;
  /** ISO date string, e.g. "2026-09-16" */
  airDate: string;
  audioUrl: string;
  sourceUrl: string | null;
  headline: string | null;
  photoUrl: string | null;
  /** AI-generated alternatives to photoUrl, picked site-wide by the imagery switch in admin. */
  illustrationUrl: string | null;
  collageUrl: string | null;
  /**
   * One of the curated CATEGORIES (see lib/categories.ts), used to filter the
   * header nav tabs. Nullable/uncategorized episodes still show under "Home".
   */
  category: string | null;
  /** One of SUBCATEGORIES[category]; groups stories into Design 2 topic-tab sections. */
  subcategory: string | null;
  /** One-sentence news summary shown on larger Design 2 cards. */
  summary: string | null;
  /** How big the story appears on Designs 2 and 3; higher levels take the bigger spots. */
  level: StoryLevel;
  /**
   * Manual draft/published switch in admin. Drafts never appear on the
   * public site, even if their air date is today or earlier. Scheduled
   * stories (`airDate` in the future) stay off the site until that morning
   * even when published.
   */
  published: boolean;
  createdAt: string;
}
