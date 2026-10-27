import { cookies } from "next/headers";
import { DESIGN_COOKIE, parseDesign } from "@/lib/design";
import { IMAGERY_COOKIE, parseImagery } from "@/lib/imagery";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { listEpisodes } from "@/lib/episodes";
import AdminLoginForm from "@/components/AdminLoginForm";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!verifySessionToken(token)) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-16">
        <AdminLoginForm />
      </main>
    );
  }

  let episodes: Awaited<ReturnType<typeof listEpisodes>> = [];
  let loadError: string | null = null;
  try {
    episodes = await listEpisodes({ includeDrafts: true });
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Failed to load episodes.";
  }

  const activeDesign = parseDesign(cookieStore.get(DESIGN_COOKIE)?.value);
  const activeImagery = parseImagery(cookieStore.get(IMAGERY_COOKIE)?.value);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      {loadError ? (
        <p className="border border-white p-4 text-sm text-white">{loadError}</p>
      ) : (
        <AdminDashboard initialEpisodes={episodes} activeDesign={activeDesign} activeImagery={activeImagery} />
      )}
    </main>
  );
}
