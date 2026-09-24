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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !publishableKey) return null
  return { url, publishableKey }
}

/** For code paths that genuinely cannot continue without it. */
export function requireSupabaseEnv(): SupabaseEnv {
  const env = readSupabaseEnv()
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local (and in the " +
        "Vercel project settings). See .env.example.",
    )
  }
  return env
}
