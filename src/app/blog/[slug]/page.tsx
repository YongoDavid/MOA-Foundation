import Image from "next/image"
import { notFound } from "next/navigation"
import { getPost, getPosts } from "@/lib/blog-fixtures"
import PostBody from "@/components/blog/PostBody"
import PostHeader from "@/components/blog/PostHeader"

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return getPosts().map((p) => ({ slug: p.slug }))
}

// Per-post metadata: title, description from excerpt, canonical, OG from the
// cover (spec §12). Article JSON-LD is deferred to Plan 3.
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <main>
      <PostHeader post={post} />

      {post.cover ? (
        <div className="mx-auto max-w-[1180px] px-10 pt-7">
          <div className="relative h-[420px] overflow-hidden rounded-[20px]">
            <Image
              src={post.cover.url as string}
              alt={post.cover.alt}
              fill
              priority
              sizes="(max-width: 1180px) 100vw, 1100px"
              className="object-cover"
            />
          </div>
          <p
            className="mt-[10px] text-[12px] font-medium leading-[1.5]"
            style={{ color: "var(--blog-ink-400)" }}
          >
            {post.cover.alt}
          </p>
        </div>
      ) : null}

      {/*
        Single <=760px column, left-aligned in the 1180px shell.
        Acceptance criterion 3: no sidebar, no donate card, no related posts.
      */}
      <article className="mx-auto max-w-[1180px] px-10 pt-[34px]">
        <PostBody blocks={post.blocks} galleryTotal={post.mediaCount} />

        {post.tags.length > 0 ? (
          <div className="mt-[34px] flex max-w-[760px] flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-[14px] py-[9px] text-[12px] font-semibold leading-none"
                style={{ background: "#F5F6F8", color: "var(--blog-ink-500)" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </article>

      <div className="h-[46px]" />
    </main>
  )
}
