import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { readSupabaseEnv } from "@/lib/supabase/env"

/**
 * Route guard for /admin, and the place the auth session gets refreshed.
 *
 * NOTE THE FILENAME. Next 16 deprecated `middleware.ts` and renamed the
 * convention to `proxy.ts`, exporting `proxy` rather than `middleware`. A file
 * called middleware.ts here would simply never run — silently, with no error.
 *
 * Two jobs:
 *   1. Refresh the Supabase session cookie. Server Components cannot write
 *      cookies, so if this did not happen the token would expire mid-session
 *      and the admin would be logged out at an arbitrary moment.
 *   2. Bounce anonymous requests for /admin to the login page.
 *
 * This is a CONVENIENCE gate, not the security boundary. Row-level security in
 * the database is the boundary — a redirect can be bypassed, a policy cannot.
 */
export async function proxy(request: NextRequest) {
  const env = readSupabaseEnv()

  // Unconfigured environment: let the request through rather than redirecting
  // in a loop. /admin renders its own "not configured" page, and the nine
  // public routes are unaffected because the matcher never sees them.
  if (!env) return NextResponse.next({ request })

  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // getUser() revalidates against Supabase. getSession() reads the cookie and
  // trusts it, which is forgeable — do not swap these.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && !pathname.startsWith("/admin/login")) {
    const login = request.nextUrl.clone()
    login.pathname = "/admin/login"
    // Come back to whatever was asked for, once signed in.
    login.searchParams.set("next", pathname)
    return NextResponse.redirect(login)
  }

  if (user && pathname.startsWith("/admin/login")) {
    const dashboard = request.nextUrl.clone()
    dashboard.pathname = "/admin"
    dashboard.search = ""
    return NextResponse.redirect(dashboard)
  }

  return response
}

export const config = {
  // ONLY /admin. Running this on the public site would add a Supabase round
  // trip to every marketing page and make nine static routes dynamic.
  matcher: ["/admin/:path*"],
}
