/**
 * Curated category list for the header nav (see components/SiteHeader.tsx).
 * Unlike a real BBC-style masthead, this isn't a generic fixed set — it's
 * kept deliberately short and only includes categories that actually fit
 * the kind of "bad humans" stories this campaign covers (AI ethics, viral
 * news, sports, politics, business, celebrity/royals culture, music/arts). Add to this list (and tag a
 * mock/real episode with the matching `category`) if a new kind of story
 * needs its own tab.
 */
export const CATEGORIES = ["News", "Sports", "Politics", "Business", "Culture", "Arts"] as const;

export type Category = (typeof CATEGORIES)[number];
