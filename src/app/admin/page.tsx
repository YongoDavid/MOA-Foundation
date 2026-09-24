import Link from "next/link"
import { getAdminUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { readSupabaseEnv } from "@/lib/supabase/env"
import { signOut } from "./actions"
import { formatDate } from "@/lib/blog-format"

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
      <Shell heading="Not configured">
        <p className="m-0 font-body text-[15px] leading-[1.65] text-ink-600">
          Supabase credentials are missing from this deployment. See{" "}
          <code>.env.example</code>.
        </p>
      </Shell>
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
    <Shell
      heading="Posts"
      action={
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-body text-[12px] font-medium text-ink-500">
            {user?.email}
          </span>
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
          No posts yet. The seed script moves the seven existing posts into the
          database — see <code>scripts/seed-blog.mjs</code>.
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
    </Shell>
  )
}

function Shell({
  heading,
  action,
  children,
}: {
  heading: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="bg-paper px-5 py-12 lg:px-14 lg:py-16">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5 border-b border-ink-900/[.14] pb-6">
          <div>
            <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-umber-800">
              Foundation admin
            </p>
            <h1 className="m-0 mt-3 font-display text-[40px] font-extrabold uppercase leading-[.98] text-ink-900">
              {heading}
            </h1>
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  )
}
