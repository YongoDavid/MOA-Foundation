import Link from "next/link"
import { getAdminUser, hasAuthCookie } from "@/lib/supabase/server"
import { readSupabaseEnv } from "@/lib/supabase/env"

/**
 * A strip shown to signed-in staff on the public blog, and to nobody else.
 *
 * It exists so an author does not have to type /admin. The alternative — a
 * "Manage posts" button visible to every reader — would be clutter on a
 * charity's blog for the overwhelming majority of visitors who cannot use it.
 *
 * Renders NOTHING for an anonymous visitor, and costs them nothing: with no
 * auth cookie present the Supabase round trip is skipped entirely.
 *
 * This is presentation only. It is not what keeps anyone out of /admin — the
 * proxy and the row-level security policies do that.
 */
export default async function StaffBar({
  editSlug,
}: {
  /** When on a post, offer to edit that specific post. */
  editSlug?: string
}) {
  if (!readSupabaseEnv()) return null
  if (!(await hasAuthCookie())) return null

  const user = await getAdminUser()
  if (!user) return null

  return (
    <div className="border-b border-gold-500/30 bg-green-950 px-5 py-2.5 lg:px-14">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-5 gap-y-2">
        <span className="font-body text-[10.5px] font-bold uppercase tracking-[.16em] text-gold-500">
          Signed in as staff
        </span>
        {editSlug ? (
          <Link
            href={`/admin/posts/${editSlug}`}
            className="flex min-h-[36px] items-center font-body text-[11px] font-bold uppercase tracking-[.09em] text-white underline-offset-4 hover:underline"
          >
            Edit this post
          </Link>
        ) : null}
        <Link
          href="/admin"
          className="flex min-h-[36px] items-center font-body text-[11px] font-bold uppercase tracking-[.09em] text-white underline-offset-4 hover:underline"
        >
          Manage posts
        </Link>
        <Link
          href="/admin/posts/new"
          className="flex min-h-[36px] items-center font-body text-[11px] font-bold uppercase tracking-[.09em] text-white underline-offset-4 hover:underline"
        >
          New post
        </Link>
      </div>
    </div>
  )
}
