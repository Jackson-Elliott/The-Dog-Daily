import { NextResponse } from "next/server";
import { scrapeStory } from "@/lib/scrape";

/** Admin-only (guarded by proxy.ts): extract a headline + photo from a news story URL. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const url = typeof body.url === "string" ? body.url : "";

  if (!url) {
    return NextResponse.json({ error: "A news story URL is required." }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Only http/https URLs are supported." }, { status: 400 });
  }

  try {
    const story = await scrapeStory(parsed.toString());
    return NextResponse.json(story);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Couldn't fetch a headline/photo from that page.",
      },
      { status: 502 }
    );
  }
}
