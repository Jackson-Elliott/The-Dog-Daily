export interface Episode {
  id: string;
  scriptName: string;
  /** ISO date string, e.g. "2026-09-16" */
  airDate: string;
  audioUrl: string;
  sourceUrl: string | null;
  headline: string | null;
  photoUrl: string | null;
  /**
   * One of the curated CATEGORIES (see lib/categories.ts), used to filter the
   * header nav tabs. Nullable/uncategorized episodes still show under "Home".
   */
  category: string | null;
  /**
   * Manual draft/published switch in admin. Drafts never appear on the
   * public site, even if their air date is today or earlier. Scheduled
   * stories (`airDate` in the future) stay off the site until that morning
   * even when published.
   */
  published: boolean;
  createdAt: string;
}
