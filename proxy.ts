import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  SITE_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/session";

const ADMIN_API_PREFIXES = [
  "/api/admin/episodes",
  "/api/admin/scrape",
  "/api/admin/generate-headline",
];

function isAdminApi(pathname: string): boolean {
  return ADMIN_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isOpenAuthPath(pathname: string): boolean {
  return (
    pathname === "/gate" ||
    pathname === "/api/site/login" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  );
}

/**
 * Site-wide password gate, plus the existing admin-only mutating API guard.
 * `/gate`, `/api/site/login`, and `/admin` login stay reachable without a
 * site session. An admin session also counts as site access.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const siteToken = request.cookies.get(SITE_SESSION_COOKIE)?.value;
  const hasAdmin = verifySessionToken(adminToken);
  const hasSiteAccess = verifySessionToken(siteToken) || hasAdmin;

  if (isAdminApi(pathname) && !hasAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSiteAccess && !isOpenAuthPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const gate = request.nextUrl.clone();
    gate.pathname = "/gate";
    gate.search = "";
    if (pathname !== "/") {
      gate.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(gate);
  }

  if (hasSiteAccess && pathname === "/gate") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
