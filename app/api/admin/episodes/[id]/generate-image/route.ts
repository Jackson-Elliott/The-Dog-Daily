import { NextResponse } from "next/server";
import { getEpisode, setGeneratedImage } from "@/lib/episodes";
import { generateStoryImage } from "@/lib/generate-image";
import { isGeneratedImageStyle } from "@/lib/imagery";

/** Image generation regularly takes 30 to 60 seconds. */
export const maxDuration = 300;

/** Admin-only (guarded by proxy.ts): generate one AI image for a story and save it. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (!isGeneratedImageStyle(body.style)) {
    return NextResponse.json({ error: "Style must be illustration or collage." }, { status: 400 });
  }

  try {
    const episode = await getEpisode(id);
    if (!episode) {
      return NextResponse.json({ error: "Episode not found." }, { status: 404 });
    }

    const url = await generateStoryImage(episode, body.style);
    const updated = await setGeneratedImage(id, body.style, url);
    return NextResponse.json({ episode: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate image.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
