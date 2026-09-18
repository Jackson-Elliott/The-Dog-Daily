import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.local.example to .env.local and fill it in.`
    );
  }
  return value;
}

export const AUDIO_BUCKET = "audio";
export const PHOTOS_BUCKET = "photos";

/**
 * Server-only Supabase client authenticated with the service role key.
 * This has full read/write access to the database and storage buckets —
 * it must never be imported into client components or exposed to the browser.
 */
export function getSupabaseAdminClient() {
  const url = requireEnv("SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
