import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { readSupabaseEnv, requireSupabaseEnv } from "./env"

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * `cookies()` is ASYNC in this version of Next — awaiting it is not optional.
 *
 * The `setAll` catch is deliberate and load-bearing. A Server Component cannot
 * write cookies; only an action or the proxy can. Supabase calls setAll when a
 * session token is refreshed, which can happen during a render, and without
 * the catch that render throws. Swallowing it is safe here because src/proxy.ts
 * refreshes the session on every matched request, so the written cookie arrives
 * by that route instead.
 */
export async function createSupabaseServerClient() {
  const { url, publishableKey } = requireSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server Component render — the proxy handles the refresh.
        }
      },
    },
  })
}

/**
 * A client, or null when Supabase is not configured.
 *
 * The blog reads through this rather than the throwing variant. A marketing
 * site must not return 500 on its own homepage because a database is
 * unreachable or an environment variable is missing from a deploy — and it
 * did: with the credentials absent, / and every blog route answered 500,
 * because the recent-posts band reads the database and the client constructor
 * threw before any query ran.
 *
 * Unconfigured now degrades to "no posts", which is wrong but harmless, and
 * leaves the nine marketing routes untouched.
 */
export async function createSupabaseServerClientOrNull() {
  if (!readSupabaseEnv()) return null
  return createSupabaseServerClient()
}

/** The signed-in admin, or null. Never throws on a missing session. */
export async function getAdminUser() {
  const supabase = await createSupabaseServerClient()
  // getUser() revalidates the token against Supabase. getSession() only reads
  // the cookie, which a client can forge — never gate access on that.
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user ?? null
}
