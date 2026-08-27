import Image from "next/image"
import { getFeatured, getPosts } from "@/lib/blog-fixtures"
import CategoryChips from "@/components/blog/CategoryChips"
import FeaturedPost from "@/components/blog/FeaturedPost"
import PostCard from "@/components/blog/PostCard"
import RecentList from "@/components/blog/RecentList"
import { SCRIM } from "@/lib/tokens"

import HeaderImage from "@/Images/MOA6.jpg"

export const metadata = {
  title: "Stories & Activities",
  description:
    "Events, outreaches and mentoring sessions from across the continent, written by our team as they happen.",
  alternates: { canonical: "/blog" },
}

// Blog index, reskinned to Direction A. Server component — the index must be
// crawlable, so nothing here fetches on the client.
//
// No <main> of its own: the root layout already provides <main id="main">, and
// nesting a second one is invalid HTML that gives screen readers two competing
// landmarks. Same in [slug] and the category route.
export default function BlogIndexPage() {
  const posts = getPosts()
  const featured = getFeatured()
  // Featured takes the hero, the next three fill the column beside it, the
  // remainder flow into the grid.
  const rest = posts.filter((p) => p.slug !== featured?.slug)
  const recent = rest.slice(0, 3)
  const grid = rest.slice(3)

  return (
    <>
      <section className="relative flex min-h-[240px] items-end bg-ink-900 lg:min-h-[200px]">
        <Image
          src={HeaderImage}
          alt="With embassy staff at the Embassy of the State of Kuwait in Abuja"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{ background: SCRIM.mobile }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{ background: SCRIM.sectionHeader }}
        />
        <div className="relative z-[1] mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-5 pb-6 pt-12 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:px-10 lg:pb-7">
          <div>
            <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-gold-500">
              From the field
            </p>
            <h1 className="m-0 mt-3 font-display text-[38px] font-extrabold uppercase leading-[.95] text-white lg:text-[50px]">
              Stories &amp; activities
            </h1>
          </div>
          <p className="m-0 max-w-[320px] font-body text-[13px] font-medium leading-[1.6] text-white/[.72] lg:text-right">
            Events, outreaches and mentoring sessions, written by our team as
            they happen.
          </p>
        </div>
      </section>

      <CategoryChips />

      <div className="bg-paper">
        <div className="mx-auto max-w-[1180px] px-5 pb-[30px] pt-8 lg:px-10 lg:pt-[34px]">
          <div className="grid items-stretch gap-[26px] lg:grid-cols-[1.35fr_1fr]">
            {featured ? <FeaturedPost post={featured} /> : null}
            <RecentList posts={recent} />
          </div>
        </div>

        {grid.length > 0 ? (
          <div className="mx-auto max-w-[1180px] px-5 pb-11 lg:px-10">
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              }}
            >
              {grid.map((post) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  variant={post.type === "story" ? "story" : "media"}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/*
        No pagination control. The design document defines `showPagination`
        with a default of false, and the fixture set is a single page — a
        rendered "1 2 3 Next" that goes nowhere would mislead in a client demo.
        Add it when there is real paged data behind it.
      */}
    </>
  )
}
