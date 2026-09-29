import { NextResponse } from "next/server";
import {
  SITE_SESSION_COOKIE,
  SITE_SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from "@/lib/session";
import { matchSitePassword } from "@/lib/site-password";

/** Not gated by proxy.ts — this is how the site session cookie is obtained. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  const result = matchSitePassword(password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SITE_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SITE_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
