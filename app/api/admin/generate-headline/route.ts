import { NextResponse } from "next/server";
import { generateJokeHeadline } from "@/lib/generate-headline";

/**
 * Admin-only (guarded by proxy.ts): rewrite a real news headline as a short
 * "Dogs would never..." style joke punchline via an LLM. Called after scraping
 * a story, and again whenever the admin wants a fresh alternative.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const realHeadline = typeof body.realHeadline === "string" ? body.realHeadline.trim() : "";

  if (!realHeadline) {
    return NextResponse.json({ error: "A real headline is required." }, { status: 400 });
  }

  try {
    const headline = await generateJokeHeadline(realHeadline);
    return NextResponse.json({ headline });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Couldn't generate a headline." },
      { status: 502 }
    );
  }
}
