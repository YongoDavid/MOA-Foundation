import Link from "next/link"
import { getAdminUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { readSupabaseEnv } from "@/lib/supabase/env"
import { signOut } from "./actions"
import { formatDate } from "@/lib/blog-format"
import { AdminShell } from "@/components/admin/AdminShell"

export const metadata = {
  title: "Posts",
  robots: { index: false, follow: false },
}

type Row = {
  id: string
  slug: string
  title: string
  status: "draft" | "published"
  category: string
  published_at: string
  featured: boolean
}

export default async function AdminDashboard() {
  if (!readSupabaseEnv()) {
    return (
      <AdminShell heading="Not configured">
        <p className="m-0 font-body text-[15px] leading-[1.65] text-ink-600">
          Supabase credentials are missing from this deployment. See{" "}
          <code>.env.example</code>.
        </p>
      </AdminShell>
    )
  }

  const user = await getAdminUser()
  const supabase = await createSupabaseServerClient()

  // Drafts are only visible to a signed-in session — that is an RLS policy,
  // not a filter applied here. If this list ever shows drafts to an anonymous
  // visitor, the policy has been changed, not this query.
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, status, category, published_at, featured")
    .order("published_at", { ascending: false })

  const posts = (data ?? []) as Row[]

  return (
    <AdminShell
      heading="Posts"
      action={
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-body text-[12px] font-medium text-ink-500">
            {user?.email}
          </span>
          <Link
            href="/admin/posts/new"
            className="flex min-h-[44px] items-center bg-ink-900 px-5 font-body text-[11px] font-bold uppercase leading-none tracking-[.09em] text-white transition-colors duration-150 hover:bg-green-900"
          >
            New post
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex min-h-[44px] items-center border border-ink-900/20 px-[18px] font-body text-[11px] font-bold uppercase leading-none tracking-[.09em] text-ink-600 transition-colors duration-150 hover:border-ink-900 hover:text-ink-900"
            >
              Sign out
            </button>
          </form>
        </div>
      }
    >
      {error ? (
        <p
          role="alert"
          className="m-0 border-l-2 border-danger bg-panel px-4 py-3 font-body text-[13px] font-medium text-ink-700"
        >
          Could not load posts: {error.message}
        </p>
      ) : posts.length === 0 ? (
        <p className="m-0 font-body text-[15px] leading-[1.65] text-ink-600">
          No posts yet. Use <strong>New post</strong> to write one, or run{" "}
          <code>node scripts/seed-blog.mjs</code> to bring across the seven
          that shipped with the site.
        </p>
      ) : (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-ink-900">
              {["Title", "Category", "Date", "Status"].map((h) => (
                <th
                  key={h}
                  className="py-3 font-body text-[10.5px] font-bold uppercase tracking-[.14em] text-ink-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-ink-900/[.14]">
                <td className="py-4 pr-4">
                  <Link
                    href={`/admin/posts/${p.slug}`}
                    className="font-display text-[19px] font-extrabold uppercase leading-[1.06] text-ink-900 underline-offset-4 hover:underline"
                  >
                    {p.title}
                  </Link>
                  {p.featured ? (
                    <span className="ml-2 bg-gold-500 px-2 py-1 font-body text-[9px] font-bold uppercase tracking-[.1em] text-ink-900">
                      Featured
                    </span>
                  ) : null}
                </td>
                <td className="py-4 pr-4 font-body text-[13px] capitalize text-ink-600">
                  {p.category}
                </td>
                <td className="py-4 pr-4 font-body text-[13px] tabular-nums text-ink-600">
                  {formatDate(p.published_at, "medium")}
                </td>
                <td className="py-4">
                  <span
                    className={`px-2 py-1 font-body text-[9.5px] font-bold uppercase tracking-[.1em] ${
                      p.status === "published"
                        ? "bg-green-900 text-white"
                        : "bg-sand-300 text-ink-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminShell>
  )
}

