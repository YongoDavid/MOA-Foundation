import Image from "next/image"
import type { Block } from "@/lib/blog-types"
import GalleryGrid from "./GalleryGrid"
import PullQuote from "./PullQuote"
import VideoPlayer from "./VideoPlayer"

// Renders the spec §6 block list.
//
// Spec §4 is explicit: unknown block kinds are SKIPPED, not thrown. A future
// CMS adding a block type must degrade to missing content, never a 500 on a
// published post.

export default function PostBody({
  blocks,
  galleryTotal,
}: {
  blocks: Block[]
  /** Real photo count for gallery blocks (e.g. 18), for the "+N" tile. */
  galleryTotal?: number
}) {
  return (
    <div className="max-w-[760px]">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "paragraph":
            return (
              <p
                key={i}
                className="mb-5 text-[17.5px] font-medium leading-[1.75]"
                style={{ color: "var(--blog-ink-700)" }}
              >
                {block.text}
              </p>
            )

          case "heading":
            return (
              <h2
                key={i}
                className="mb-4 mt-9 text-[22px] font-extrabold leading-[1.25] tracking-[-.015em]"
              >
                {block.text}
              </h2>
            )

          case "quote":
            return (
              <div key={i} className="my-8">
                <PullQuote text={block.text} attribution={block.attribution} />
              </div>
            )

          case "gallery":
            return (
              <GalleryGrid key={i} images={block.items} total={galleryTotal} />
            )

          case "video":
            return (
              <div key={i} className="mb-[34px]">
                <VideoPlayer
                  poster={block.poster}
                  duration={block.duration}
                  caption={block.caption}
                />
              </div>
            )

          case "image":
            return (
              <figure key={i} className="my-6">
                <div className="relative h-[360px] overflow-hidden rounded-[18px]">
                  <Image
                    src={block.media.url as string}
                    alt={block.media.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 760px"
                    className="object-cover"
                  />
                </div>
                {block.caption ? (
                  <figcaption
                    className="mt-[10px] text-[12px] font-medium leading-[1.5]"
                    style={{ color: "var(--blog-ink-400)" }}
                  >
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            )

          default:
            // Unknown kind — skip silently rather than throw (spec §4).
            return null
        }
      })}
    </div>
  )
}
