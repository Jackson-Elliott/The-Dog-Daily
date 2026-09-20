import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  SITE_SESSION_COOKIE,
  SITE_SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from "@/lib/session";

/** Not gated by proxy.ts — this is how the site session cookie is obtained. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";

  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    return NextResponse.json(
      { error: "SITE_PASSWORD is not configured on the server." },
      { status: 500 }
    );
  }

  const providedBuf = Buffer.from(password);
  const expectedBuf = Buffer.from(sitePassword);
  const isValid =
    providedBuf.length === expectedBuf.length && crypto.timingSafeEqual(providedBuf, expectedBuf);

  if (!isValid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
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
