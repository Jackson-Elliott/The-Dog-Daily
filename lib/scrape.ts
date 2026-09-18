import * as cheerio from "cheerio";

export interface ScrapedStory {
  headline: string | null;
  imageUrl: string | null;
  sourceUrl: string;
}

function absolutize(url: string | undefined, base: string): string | null {
  if (!url) return null;
  try {
    return new URL(url, base).toString();
  } catch {
    return null;
  }
}

/**
 * Fetches a news story page and extracts a headline and photo using Open Graph /
 * Twitter Card meta tags (falling back to <title>). Works without any paid API for
 * the vast majority of news sites, which all publish these tags for social sharing.
 */
export async function scrapeStory(url: string): Promise<ScrapedStory> {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; TheDogDailyBot/1.0; +https://thedogdaily.example)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`That page responded with status ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    throw new Error("That URL doesn't look like a webpage (unexpected content type).");
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const headline =
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $('meta[name="twitter:title"]').attr("content")?.trim() ||
    $("title").first().text().trim() ||
    null;

  const rawImage =
    $('meta[property="og:image:secure_url"]').attr("content") ||
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    undefined;

  return {
    headline,
    imageUrl: absolutize(rawImage, url),
    sourceUrl: url,
  };
}
