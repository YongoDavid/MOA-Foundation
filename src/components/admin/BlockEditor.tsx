"use client"

import ImageField from "./ImageField"
import type { Block, MediaItem } from "@/lib/blog-types"

const EMPTY_MEDIA: MediaItem = { url: "", alt: "", width: 0, height: 0 }

const KINDS: { kind: Block["kind"]; label: string }[] = [
  { kind: "paragraph", label: "Paragraph" },
  { kind: "heading", label: "Heading" },
  { kind: "image", label: "Image" },
  { kind: "gallery", label: "Gallery" },
  { kind: "quote", label: "Quote" },
  { kind: "video", label: "Video" },
]

function blank(kind: Block["kind"]): Block {
  switch (kind) {
    case "paragraph": return { kind, text: "" }
    case "heading": return { kind, text: "" }
    case "image": return { kind, media: { ...EMPTY_MEDIA } }
    case "gallery": return { kind, items: [] }
    case "quote": return { kind, text: "" }
    case "video": return { kind, poster: { ...EMPTY_MEDIA }, duration: "0:00" }
  }
}

/**
 * The post body: an ordered list of typed blocks.
 *
 * PostBody renders exactly this union and SKIPS any kind it does not know
 * rather than throwing, so adding a kind here without teaching PostBody about
 * it degrades to missing content, never a 500 on a published post.
 */
export default function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: Block[]
  onChange: (next: Block[]) => void
}) {
  const replace = (i: number, b: Block) =>
    onChange(blocks.map((x, n) => (n === i ? b : x)))
  const remove = (i: number) => onChange(blocks.filter((_, n) => n !== i))
  const move = (i: number, by: number) => {
    const j = i + by
    if (j < 0 || j >= blocks.length) return
    const next = [...blocks]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        {blocks.map((b, i) => (
          <article key={i} className="border border-ink-900/[.16] bg-paper">
            <header className="flex items-center justify-between gap-3 border-b border-ink-900/[.14] bg-panel px-4 py-2">
              <span className="font-body text-[10.5px] font-bold uppercase tracking-[.14em] text-umber-800">
                {i + 1} · {b.kind}
              </span>
              <div className="flex items-center gap-1">
                <Ctl label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>↑</Ctl>
                <Ctl label="Move down" onClick={() => move(i, 1)} disabled={i === blocks.length - 1}>↓</Ctl>
                <Ctl label="Delete block" onClick={() => remove(i)} danger>✕</Ctl>
              </div>
            </header>

            <div className="p-4">
              {b.kind === "paragraph" || b.kind === "heading" || b.kind === "quote" ? (
                <>
                  <textarea
                    value={b.text}
                    onChange={(e) => replace(i, { ...b, text: e.target.value })}
                    rows={b.kind === "paragraph" ? 5 : 2}
                    placeholder={
                      b.kind === "quote" ? "The quotation, without quote marks — they are added by the design." : "…"
                    }
                    className="w-full resize-y border border-ink-900/[.18] p-3 font-body text-[14px] leading-[1.6] text-ink-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-umber-600"
                  />
                  {b.kind === "quote" ? (
                    <input
                      value={b.attribution ?? ""}
                      onChange={(e) => replace(i, { ...b, attribution: e.target.value })}
                      placeholder="Attribution — e.g. Executive Director"
                      className="mt-2 min-h-[44px] w-full border border-ink-900/[.18] px-3 font-body text-[13.5px] text-ink-900 outline-none"
                    />
                  ) : null}
                </>
              ) : null}

              {b.kind === "image" ? (
                <>
                  <ImageField
                    label="Image"
                    value={b.media.url ? b.media : null}
                    onChange={(media) => replace(i, { ...b, media })}
                    onClear={() => replace(i, { ...b, media: { ...EMPTY_MEDIA } })}
                  />
                  <input
                    value={b.caption ?? ""}
                    onChange={(e) => replace(i, { ...b, caption: e.target.value })}
                    placeholder="Caption (optional)"
                    className="mt-2 min-h-[44px] w-full border border-ink-900/[.18] px-3 font-body text-[13.5px] text-ink-900 outline-none"
                  />
                </>
              ) : null}

              {b.kind === "video" ? (
                <>
                  <ImageField
                    label="Poster frame"
                    value={b.poster.url ? b.poster : null}
                    onChange={(poster) => replace(i, { ...b, poster })}
                    onClear={() => replace(i, { ...b, poster: { ...EMPTY_MEDIA } })}
                  />
                  <input
                    value={b.duration}
                    onChange={(e) => replace(i, { ...b, duration: e.target.value })}
                    placeholder="Duration, m:ss"
                    className="mt-2 min-h-[44px] w-full border border-ink-900/[.18] px-3 font-body text-[13.5px] text-ink-900 outline-none"
                  />
                  <p className="m-0 mt-2 font-body text-[12px] leading-[1.5] text-ink-500">
                    The player shows this poster and cannot play — there is no
                    media pipeline yet. It never autoplays.
                  </p>
                </>
              ) : null}

              {b.kind === "gallery" ? (
                <div className="flex flex-col gap-3">
                  {b.items.map((item, k) => (
                    <ImageField
                      key={k}
                      label={`Photograph ${k + 1}`}
                      value={item.url ? item : null}
                      onChange={(media) =>
                        replace(i, {
                          ...b,
                          items: b.items.map((x, n) => (n === k ? media : x)),
                        })
                      }
                      onClear={() =>
                        replace(i, { ...b, items: b.items.filter((_, n) => n !== k) })
                      }
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => replace(i, { ...b, items: [...b.items, { ...EMPTY_MEDIA }] })}
                    className="min-h-[44px] self-start border border-ink-900/20 px-4 font-body text-[11px] font-bold uppercase tracking-[.09em] text-ink-900"
                  >
                    Add photograph
                  </button>
                  <p className="m-0 font-body text-[12px] leading-[1.5] text-ink-500">
                    The first three show as tiles; the rest appear behind a
                    &ldquo;+N&rdquo; that opens the full set.
                  </p>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-ink-900/[.14] pt-5">
        <span className="flex min-h-[44px] items-center font-body text-[10.5px] font-bold uppercase tracking-[.14em] text-ink-400">
          Add block
        </span>
        {KINDS.map((k) => (
          <button
            key={k.kind}
            type="button"
            onClick={() => onChange([...blocks, blank(k.kind)])}
            className="min-h-[44px] border border-ink-900/20 px-4 font-body text-[11px] font-bold uppercase tracking-[.09em] text-ink-900 transition-colors duration-150 hover:border-ink-900 hover:bg-ink-900 hover:text-white"
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Ctl({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center font-body text-[13px] font-bold disabled:opacity-30 ${
        danger ? "text-danger" : "text-ink-600"
      }`}
    >
      {children}
    </button>
  )
}
