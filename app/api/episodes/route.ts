import { NextResponse } from "next/server";
import { listEpisodes } from "@/lib/episodes";

/** Public: list live episodes (air date today or earlier, Sydney time), newest first. */
export async function GET() {
  try {
    const episodes = await listEpisodes();
    return NextResponse.json({ episodes });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load episodes." },
      { status: 500 }
    );
  }
}
