import { NextResponse } from "next/server";
import { DESIGN_COOKIE, isDesignId } from "@/lib/design";

const DESIGN_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

/** Admin-only (guarded by proxy.ts): persist the public site design. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const design = typeof body.design === "number" ? body.design : Number(body.design);

  if (!isDesignId(design)) {
    return NextResponse.json({ error: "Design must be 1, 2, or 3." }, { status: 400 });
  }

  const response = NextResponse.json({ design });
  response.cookies.set(DESIGN_COOKIE, String(design), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DESIGN_MAX_AGE_SECONDS,
  });
  return response;
}
