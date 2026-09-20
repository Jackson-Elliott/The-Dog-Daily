import crypto from "crypto";

export const ADMIN_SESSION_COOKIE = "dd_admin_session";
export const SITE_SESSION_COOKIE = "dd_site_session";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
export const SITE_SESSION_MAX_AGE_SECONDS = ADMIN_SESSION_MAX_AGE_SECONDS;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "Missing required environment variable: SESSION_SECRET. Copy .env.local.example to .env.local and fill it in."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** Creates a signed, expiring session token to store in the admin session cookie. */
export function createSessionToken(): string {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

/** Verifies the signature and expiry of a session token from the admin session cookie. */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;

  let expectedSignature: string;
  try {
    expectedSignature = sign(encoded);
  } catch {
    return false;
  }

  const providedBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (providedBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) return false;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
      exp?: number;
    };
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
