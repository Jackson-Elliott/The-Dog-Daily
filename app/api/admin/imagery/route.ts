import { NextResponse } from "next/server";
import { IMAGERY_COOKIE, isImagery } from "@/lib/imagery";

const IMAGERY_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

/** Admin-only (guarded by proxy.ts): persist which image style the public site shows. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (!isImagery(body.imagery)) {
    return NextResponse.json({ error: "Imagery must be photos, illustrations, collage, or mix." }, { status: 400 });
  }

  const response = NextResponse.json({ imagery: body.imagery });
  response.cookies.set(IMAGERY_COOKIE, body.imagery, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: IMAGERY_MAX_AGE_SECONDS,
  });
  return response;
}
