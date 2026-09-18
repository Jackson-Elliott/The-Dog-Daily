import NewsHomeClient from "@/components/NewsHomeClient";
import { listEpisodes } from "@/lib/episodes";
import type { Episode } from "@/types/episode";

// Episodes change whenever the admin uploads a new one, and future-dated
// drafts become public on their air date, so always fetch fresh data instead
// of freezing the list at build time.
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

  return <NewsHomeClient episodes={episodes} />;
}
