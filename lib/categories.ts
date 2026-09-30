/**
 * Curated category list for the header nav (see components/SiteHeader.tsx).
 * Unlike a real BBC-style masthead, this isn't a generic fixed set — it's
 * kept deliberately short and only includes categories that actually fit
 * the kind of "bad humans" stories this campaign covers (AI ethics, viral
 * news, sports, politics, business, celebrity/royals culture, music). Add to this list (and tag a
 * mock/real episode with the matching `category`) if a new kind of story
 * needs its own tab.
 */
export const CATEGORIES = ["News", "Sports", "Politics", "Business", "Culture"] as const;

export type Category = (typeof CATEGORIES)[number];

/** Older tags folded into a current CATEGORIES value. */
const CATEGORY_ALIASES: Record<string, Category> = {
  Art: "Culture",
  Arts: "Culture",
};

export function normalizeCategory(value: string | null | undefined): string | null {
  if (!value) return null;
  return CATEGORY_ALIASES[value] ?? value;
}

/** Header tab between Culture and Adopt — every live episode, no hero. */
export const ALL_VIEW = "All";

/** null is Home. "All" is the archive grid. Anything else is a category filter. */
export type ActiveCategory = Category | typeof ALL_VIEW | null;
