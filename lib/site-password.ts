import crypto from "crypto";

/** Compare a submitted password to SITE_PASSWORD without leaking length via early return. */
export function matchSitePassword(
  password: string,
): { ok: true } | { ok: false; error: string; status: 401 | 500 } {
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    return {
      ok: false,
      error: "SITE_PASSWORD is not configured on the server.",
      status: 500,
    };
  }

  const providedBuf = Buffer.from(password);
  const expectedBuf = Buffer.from(sitePassword);
  const isValid =
    providedBuf.length === expectedBuf.length && crypto.timingSafeEqual(providedBuf, expectedBuf);

  if (!isValid) {
    return { ok: false, error: "Incorrect password.", status: 401 };
  }

  return { ok: true };
}
