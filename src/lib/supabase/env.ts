/**
 * Supabase configuration, read once and validated.
 *
 * Two keys exist and only ONE of them belongs in this file's world:
 *
 *   PUBLISHABLE (sb_publishable_…) — compiled into the browser bundle by
 *     design. Everything the public site and the admin session do goes
 *     through it, and row-level security is what makes that safe.
 *
 *   SECRET (sb_secret_…) — bypasses every RLS policy. It is NOT read here
 *     and is not imported by any application code. Only scripts/seed-blog.mjs
 *     touches it, run from a terminal, never from a request.
 *
 * Missing configuration must not crash the public site. The nine marketing
 * routes have no database dependency, and a half-configured environment
 * should degrade to "the admin area is unavailable", not a 500 on the
 * homepage.
 */
export type SupabaseEnv = { url: string; publishableKey: string }

export function readSupabaseEnv(): SupabaseEnv | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!raw || !publishableKey) return null

  // Normalise to the ORIGIN. The Supabase dashboard shows several URLs on the
  // same screen and the REST endpoint is the easy one to grab by mistake:
  // pasting "https://<ref>.supabase.co/rest/v1/" sends every request to
  // ".../rest/v1//rest/v1/…", and the project answers PGRST125 "Invalid path"
  // to everything — including /auth/v1/token, so signing in fails with what
  // looks exactly like a wrong password. That cost a debugging session.
  //
  // The project URL is always a bare origin, so taking .origin is lossless
  // and makes either value work.
  let url: string
  try {
    url = new URL(raw).origin
  } catch {
    return null
  }

  return { url, publishableKey }
}

/** For code paths that genuinely cannot continue without it. */
export function requireSupabaseEnv(): SupabaseEnv {
  const env = readSupabaseEnv()
  if (!env) {
    throw new Error(
      "Supabase is not configured, or NEXT_PUBLIC_SUPABASE_URL is not a valid " +
        "URL. Set NEXT_PUBLIC_SUPABASE_URL (the bare Project URL, e.g. " +
        "https://abcdefgh.supabase.co — not the REST endpoint) and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local, and in the Vercel " +
        "project settings. See .env.example.",
    )
  }
  return env
}
