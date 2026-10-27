import { cookies } from "next/headers";
import NewsHomeClient from "@/components/NewsHomeClient";
import { DESIGN_COOKIE, parseDesign } from "@/lib/design";
import { IMAGERY_COOKIE, imageForImagery, parseImagery } from "@/lib/imagery";
import { listEpisodes } from "@/lib/episodes";
import type { Episode } from "@/types/episode";

// Episodes change whenever the admin uploads or publishes one, and
// scheduled stories become public on their air date, so always fetch
// fresh data instead of freezing the list at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let episodes: Episode[] = [];
  let loadError: string | null = null;

  try {
    episodes = await listEpisodes();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Failed to load episodes.";
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <p className="max-w-md text-sm text-neutral-500">{loadError}</p>
      </main>
    );
  }

  const cookieStore = await cookies();
  const design = parseDesign(cookieStore.get(DESIGN_COOKIE)?.value);
  const imagery = parseImagery(cookieStore.get(IMAGERY_COOKIE)?.value);
  const shown = episodes.map((episode) => ({ ...episode, photoUrl: imageForImagery(episode, imagery) }));
  return <NewsHomeClient episodes={shown} design={design} imagery={imagery} />;
}
