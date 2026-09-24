import LoginForm from "./LoginForm"
import { readSupabaseEnv } from "@/lib/supabase/env"

export const metadata = {
  title: "Sign in",
  // Keep the admin area out of search results entirely.
  robots: { index: false, follow: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const raw = Array.isArray(sp.next) ? sp.next[0] : sp.next
  // Never round-trip an arbitrary destination through the login form.
  const next = raw && raw.startsWith("/admin") ? raw : "/admin"

  const configured = readSupabaseEnv() !== null

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-paper px-5 py-16">
      <div className="w-full max-w-[440px] bg-green-900 px-6 py-10 lg:px-10">
        <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-gold-500">
          Foundation staff
        </p>
        <h1 className="m-0 mb-7 mt-3.5 font-display text-[34px] font-extrabold uppercase leading-[1.02] text-white">
          Sign in
        </h1>

        {configured ? (
          <LoginForm next={next} />
        ) : (
          <p className="m-0 font-body text-[14px] font-medium leading-[1.65] text-white/70">
            The admin area is not configured on this deployment. Set{" "}
            <code className="text-gold-500">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="text-gold-500">
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
            </code>
            , then reload.
          </p>
        )}
      </div>
    </div>
  )
}
