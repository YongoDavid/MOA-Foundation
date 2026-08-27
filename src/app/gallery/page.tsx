import Link from "next/link"
import PhotoGrid, { parseFilter, parseShown } from "@/components/gallery/PhotoGrid"
import { PHOTOS } from "@/lib/gallery"

export const metadata = {
  title: "Gallery",
  description:
    "Courtesy visits, summits and advocacy engagements. Every image is from a real Moses Mentoring Foundation activity.",
  alternates: { canonical: "/gallery" },
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const filter = parseFilter(sp.category)
  const shown = parseShown(sp.show)

  return (
    <>
      {/* No photographic hero — the grid below is the photography, and a hero
          image above it would just be a twentieth photograph competing with
          the nineteen the page exists to show. */}
      <section className="bg-paper px-5 pb-8 pt-12 lg:px-14 lg:pb-[34px] lg:pt-[60px]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 lg:flex-row lg:items-end lg:gap-16">
          <div>
            <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-umber-800">
              Gallery
            </p>
            <h1 className="m-0 mt-4 font-display text-[42px] font-black uppercase leading-[.92] text-ink-900 [text-wrap:balance] lg:text-[66px]">
              The work, <span className="text-umber-600">in pictures</span>
            </h1>
          </div>
          <p className="m-0 max-w-[400px] font-body text-[14.5px] font-medium leading-[1.7] text-ink-600">
            Courtesy visits, summits and advocacy engagements. Every image is
            from a real Foundation activity — {PHOTOS.length} in total.
          </p>
        </div>
      </section>

      <PhotoGrid filter={filter} shown={shown} />

      <section className="bg-green-900 px-5 py-12 lg:px-14 lg:py-16">
        <div className="mx-auto grid max-w-[1440px] items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div>
            <h2 className="m-0 font-display text-[30px] font-extrabold uppercase leading-[1.02] text-white lg:text-[40px]">
              Read the story
              <br />
              behind the pictures
            </h2>
            <p className="m-0 mt-3.5 max-w-[520px] font-body text-[15px] font-medium leading-[1.65] text-white/75">
              Each engagement here is written up on the blog, with the full
              photo set and space to comment.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex min-h-[48px] items-center justify-center bg-gold-500 px-7 font-body text-[12px] font-bold uppercase leading-none tracking-[.09em] text-ink-900 transition-colors duration-150 hover:bg-gold-200 lg:min-h-[44px]"
          >
            Go to the blog
          </Link>
        </div>
      </section>
    </>
  )
}
