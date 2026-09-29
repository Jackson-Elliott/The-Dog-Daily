"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SITE_SESSION_COOKIE,
  SITE_SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from "@/lib/session";
import { matchSitePassword } from "@/lib/site-password";

function safeNextPath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/gate")) {
    return "/";
  }
  return value;
}

/** Native form POST for the site gate — works even when client JS does not hydrate. */
export async function loginSite(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "");
  const result = matchSitePassword(password);
  if (!result.ok) return result.error;

  const store = await cookies();
  store.set(SITE_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SITE_SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });

  redirect(safeNextPath(from));
}
