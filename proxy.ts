import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Guards the admin-only mutating API routes (create/delete episodes, scrape).
 * The `/admin` page itself checks the session server-side and renders a login
 * form when unauthenticated, and `/api/admin/login` + `/api/admin/logout` are
 * intentionally excluded here since they must be reachable without a session.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/admin/episodes",
    "/api/admin/episodes/:path*",
    "/api/admin/scrape",
    "/api/admin/generate-headline",
  ],
};
