"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import BlockEditor from "./BlockEditor"
import ImageField from "./ImageField"
import { savePost, deletePost, type SaveState } from "@/app/admin/posts/actions"
import { CATEGORIES } from "@/lib/blog-types"
import type { Block, MediaItem, Post } from "@/lib/blog-types"

const TYPES = ["gallery", "video", "story"] as const

export type EditorPost = {
  slug: string
  title: string
  excerpt: string
  type: Post["type"]
  category: Post["category"]
  status: Post["status"]
  author: string
  publishedAt: string
  readTime: number
  tags: string[]
  featured: boolean
  cover: MediaItem | null
  blocks: Block[]
  mediaCount: number | null
  videoDuration: string | null
}

export default function PostEditor({
  initial,
  isNew,
  saved,
}: {
  initial: EditorPost
  isNew: boolean
  saved?: "created" | "edited"
}) {
  const [p, setP] = useState<EditorPost>(initial)
  const [state, action, pending] = useActionState<SaveState, FormData>(savePost, {})
  const set = <K extends keyof EditorPost>(k: K, v: EditorPost[K]) =>
    setP((prev) => ({ ...prev, [k]: v }))

  // Publishing with an image that has no alt text would put an undescribed
  // photograph on a live page. Warn here rather than let it through and
  // discover it in an audit later.
  const missingAlt =
    (p.cover && !p.cover.alt.trim() ? 1 : 0) +
    p.blocks.filter(
      (b) =>
        (b.kind === "image" && b.media.url && !b.media.alt.trim()) ||
        (b.kind === "video" && b.poster.url && !b.poster.alt.trim()) ||
        (b.kind === "gallery" && b.items.some((i) => i.url && !i.alt.trim())),
    ).length

  return (
    <form action={action}>
      {/* The whole document goes over as one JSON field. Blocks are a nested,
          ordered, heterogeneous structure; flattening them into form fields
          would mean re-parsing them on the server for no gain. */}
      <input type="hidden" name="payload" value={JSON.stringify({ ...p, originalSlug: isNew ? null : initial.slug })} />

      {saved ? <SavedBanner kind={saved} post={p} /> : null}
      {state.error ? (
        <p role="alert" className="m-0 mb-6 border-l-2 border-danger bg-panel px-4 py-3 font-body text-[13px] font-semibold text-ink-900">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-10">
        <div className="min-w-0">
          <Label>Title</Label>
          <input
            value={p.title}
            onChange={(e) => set("title", e.target.value)}
            className="mb-5 min-h-[56px] w-full border border-ink-900/[.18] px-4 font-display text-[28px] font-extrabold uppercase text-ink-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-umber-600"
          />

          <Label>Excerpt — the line that appears on cards</Label>
          <textarea
            value={p.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            rows={2}
            className="mb-5 w-full resize-y border border-ink-900/[.18] p-3 font-body text-[14px] leading-[1.6] text-ink-900 outline-none"
          />

          <Label>Cover</Label>
          <div className="mb-8">
            <ImageField
              label="Cover image"
              value={p.cover}
              onChange={(cover) => set("cover", cover)}
              onClear={() => set("cover", null)}
            />
            <p className="m-0 mt-2 font-body text-[12px] leading-[1.5] text-ink-500">
              Story posts have no cover by design — leave this empty and the
              card renders on the green ground instead.
            </p>
          </div>

          <h2 className="m-0 mb-4 border-b-2 border-ink-900 pb-3 font-display text-[24px] font-extrabold uppercase text-ink-900">
            Body
          </h2>
          <BlockEditor blocks={p.blocks} onChange={(b) => set("blocks", b)} />
        </div>

        <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
          <Panel>
            <Label>Status</Label>
            <Select
              value={p.status}
              onChange={(v) => set("status", v as Post["status"])}
              options={[["published", "Published — live on the site"], ["draft", "Draft — only you can see it"]]}
            />

            <Label>Web address</Label>
            {isNew ? (
              <>
                <input
                  value={p.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="made from the title if left empty"
                  className="mb-1 min-h-[44px] w-full border border-ink-900/[.18] px-3 font-body text-[13px] text-ink-900 outline-none"
                />
                <p className="m-0 mb-4 font-body text-[11.5px] leading-[1.5] text-ink-500">
                  The end of the web address — /blog/your-post. Leave it empty
                  and it is made from the title.
                </p>
              </>
            ) : (
              <>
                <p className="m-0 mb-1 break-words bg-panel px-3 py-2.5 font-body text-[13px] text-ink-600">
                  /blog/{p.slug}
                </p>
                <p className="m-0 mb-4 font-body text-[11.5px] leading-[1.5] text-ink-500">
                  This is where the post lives on the website. It cannot be
                  changed once the post exists — its comments are attached to
                  it, and anyone who has already shared the link would get a
                  missing page.
                </p>
              </>
            )}

            <Label>Category</Label>
            <Select
              value={p.category}
              onChange={(v) => set("category", v as Post["category"])}
              options={CATEGORIES.map((c) => [c.slug, c.label] as [string, string])}
            />

            <Label>Type</Label>
            <Select
              value={p.type}
              onChange={(v) => set("type", v as Post["type"])}
              options={TYPES.map((t) => [t, t[0].toUpperCase() + t.slice(1)] as [string, string])}
            />

            <Label>Date</Label>
            <input
              type="date"
              value={p.publishedAt}
              onChange={(e) => set("publishedAt", e.target.value)}
              className="mb-4 min-h-[44px] w-full border border-ink-900/[.18] px-3 font-body text-[13px] text-ink-900 outline-none"
            />

            <Label>Author</Label>
            <input
              value={p.author}
              onChange={(e) => set("author", e.target.value)}
              className="mb-4 min-h-[44px] w-full border border-ink-900/[.18] px-3 font-body text-[13px] text-ink-900 outline-none"
            />

            <Label>Read time (minutes)</Label>
            <input
              type="number"
              min={1}
              max={60}
              value={p.readTime}
              onChange={(e) => set("readTime", Number(e.target.value))}
              className="mb-4 min-h-[44px] w-full border border-ink-900/[.18] px-3 font-body text-[13px] tabular-nums text-ink-900 outline-none"
            />

            <Label>Tags — comma separated</Label>
            <input
              value={p.tags.join(", ")}
              onChange={(e) =>
                set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))
              }
              className="mb-4 min-h-[44px] w-full border border-ink-900/[.18] px-3 font-body text-[13px] text-ink-900 outline-none"
            />

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={p.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="mt-0.5 h-[18px] w-[18px] flex-none appearance-none border border-ink-900/35 checked:bg-green-900"
              />
              <span className="font-body text-[12.5px] leading-[1.5] text-ink-700">
                Feature on the blog index. Only one post can be — choosing this
                unfeatures the current one.
              </span>
            </label>
          </Panel>

          {missingAlt > 0 ? (
            <p className="m-0 border-l-2 border-danger bg-panel px-4 py-3 font-body text-[12.5px] leading-[1.55] text-ink-700">
              <strong>{missingAlt}</strong> image
              {missingAlt === 1 ? " has" : "s have"} no alt text. Add a
              description before publishing — it is what a screen reader, and
              anyone on a failed connection, gets instead of the photograph.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="min-h-[52px] bg-ink-900 px-6 font-body text-[12px] font-bold uppercase tracking-[.09em] text-white transition-colors duration-150 hover:bg-green-900 disabled:opacity-60"
          >
            {pending ? "Saving…" : isNew ? "Create post" : "Save changes"}
          </button>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/admin"
              className="flex min-h-[44px] items-center font-body text-[11px] font-bold uppercase tracking-[.09em] text-ink-600 underline-offset-4 hover:underline"
            >
              Back to posts
            </Link>
            {!isNew && p.status === "published" ? (
              <Link
                href={`/blog/${p.slug}`}
                target="_blank"
                className="flex min-h-[44px] items-center font-body text-[11px] font-bold uppercase tracking-[.09em] text-umber-600 underline-offset-4 hover:underline"
              >
                View live →
              </Link>
            ) : null}
          </div>
        </aside>
      </div>

      {!isNew ? (
        <div className="mt-12 border-t border-ink-900/[.14] pt-6">
          <DeleteButton slug={initial.slug} title={initial.title} />
        </div>
      ) : null}
    </form>
  )
}

/**
 * Delete needs its own form. It cannot be a button inside the editor's form —
 * that would submit the editor with a different action, and a stray Enter
 * keypress in any text field would fire whichever button came first.
 */
function DeleteButton({ slug, title }: { slug: string; title: string }) {
  const [confirming, setConfirming] = useState(false)
  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="min-h-[44px] font-body text-[11px] font-bold uppercase tracking-[.09em] text-danger underline-offset-4 hover:underline"
      >
        Delete this post
      </button>
    )
  }
  return (
    <div className="border-l-2 border-danger bg-panel px-4 py-4">
      <p className="m-0 mb-3 font-body text-[13px] leading-[1.55] text-ink-900">
        Delete <strong>{title}</strong>? Its comments go with it, and the link
        will 404 for anyone who has it. This cannot be undone.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          formAction={deletePost}
          formNoValidate
          name="slug"
          value={slug}
          className="min-h-[44px] bg-danger px-5 font-body text-[11px] font-bold uppercase tracking-[.09em] text-white"
        >
          Yes, delete it
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="min-h-[44px] border border-ink-900/20 px-5 font-body text-[11px] font-bold uppercase tracking-[.09em] text-ink-900"
        >
          Keep it
        </button>
      </div>
    </div>
  )
}

/**
 * Confirmation after a save.
 *
 * Deliberately loud. The old version was a one-word grey line that a person
 * scrolled past without registering, and the client said as much: an author
 * needs to know the work landed, and whether it is actually visible to the
 * public or sitting as a draft.
 *
 * role="status" announces it to a screen reader without stealing focus.
 * Dismissible, because it should not sit there implying a save that happened
 * ten minutes ago is the state of the form now.
 */
function SavedBanner({
  kind,
  post,
}: {
  kind: "created" | "edited"
  post: EditorPost
}) {
  const [open, setOpen] = useState(true)
  if (!open) return null

  const live = post.status === "published"

  return (
    <div
      role="status"
      className="mb-7 flex flex-wrap items-center justify-between gap-4 border-l-4 border-gold-500 bg-green-900 px-5 py-4"
    >
      <div className="min-w-0">
        <p className="m-0 font-display text-[22px] font-extrabold uppercase leading-none text-white">
          {kind === "created" ? "Post created" : "Changes saved"}
        </p>
        <p className="m-0 mt-2 font-body text-[13px] leading-[1.55] text-white/[.78]">
          {live ? (
            <>
              It is live on the website now, at{" "}
              <span className="text-gold-500 [overflow-wrap:anywhere]">
                /blog/{post.slug}
              </span>.
            </>
          ) : (
            <>
              Saved as a <strong className="text-white">draft</strong> — nobody
              but you can see it. Set the status to Published when it is ready.
            </>
          )}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {live ? (
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="flex min-h-[44px] items-center bg-gold-500 px-5 font-body text-[11px] font-bold uppercase tracking-[.09em] text-ink-900 transition-colors duration-150 hover:bg-gold-200"
          >
            View it live →
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Dismiss this message"
          className="flex min-h-[44px] items-center font-body text-[11px] font-bold uppercase tracking-[.09em] text-white/60 hover:text-white"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 mb-2 font-body text-[10.5px] font-bold uppercase tracking-[.14em] text-ink-400">
      {children}
    </p>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="border border-ink-900/[.16] bg-paper p-5">{children}</div>
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: [string, string][]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mb-4 min-h-[44px] w-full appearance-none border border-ink-900/[.18] bg-paper px-3 font-body text-[13px] text-ink-900 outline-none"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  )
}
