"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { uploadMedia } from "@/app/admin/posts/actions"
import type { MediaItem } from "@/lib/blog-types"

/**
 * Pick an image, upload it, capture its alt text.
 *
 * Dimensions are read IN THE BROWSER before upload and stored on the
 * MediaItem. next/image needs width and height for a remote image, and the
 * server has no image library to measure with — the browser already decoded
 * the file to show a preview, so it is the cheapest place to ask.
 *
 * Alt text is required, not optional. Every photograph on this site carries a
 * real description; a CMS that lets an author skip it is how that stops being
 * true by the third post.
 */
export default function ImageField({
  label,
  value,
  onChange,
  onClear,
}: {
  label: string
  value: MediaItem | null
  onChange: (item: MediaItem) => void
  onClear?: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function pick(file: File) {
    setError(null)
    setBusy(true)
    try {
      const dims = await readDimensions(file)
      const fd = new FormData()
      fd.set("file", file)
      const res = await uploadMedia(fd)
      if (res.error || !res.url) {
        setError(res.error ?? "Upload failed.")
        return
      }
      onChange({ url: res.url, alt: value?.alt ?? "", ...dims })
    } catch {
      setError("Could not read that file.")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="border border-ink-900/[.16] p-4">
      <p className="m-0 mb-3 font-body text-[10.5px] font-bold uppercase tracking-[.14em] text-ink-400">
        {label}
      </p>

      {/* 120px preview + 16px gap + the alt input came to exactly the 350px a
          390px phone offers — no slack, so any padding pushed it over. Stacked
          until there is room for a row. */}
      {value?.url ? (
        <div className="mb-3 flex flex-col gap-4 sm:flex-row">
          <div className="relative h-[90px] w-[120px] flex-none overflow-hidden bg-sand-200">
            <Image src={value.url} alt="" fill sizes="120px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <label className="mb-1 block font-body text-[10px] font-bold uppercase tracking-[.12em] text-ink-400">
              Alt text — describe what is happening
            </label>
            <input
              value={value.alt}
              onChange={(e) => onChange({ ...value, alt: e.target.value })}
              placeholder="e.g. The delegation with embassy staff in Abuja"
              className="min-h-[44px] w-full border border-ink-900/[.18] px-3 font-body text-[13.5px] text-ink-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-umber-600"
            />
            {!value.alt.trim() ? (
              <p className="m-0 mt-1.5 font-body text-[11.5px] font-medium text-danger">
                Alt text is required before this post can be published.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void pick(f)
          }}
          className="w-full min-w-0 max-w-full font-body text-[12.5px] text-ink-600 file:mr-3 file:min-h-[40px] file:border file:border-ink-900/20 file:bg-paper file:px-4 file:font-body file:text-[11px] file:font-bold file:uppercase file:tracking-[.09em] file:text-ink-900"
        />
        {busy ? (
          <span className="font-body text-[12px] text-ink-500">Uploading…</span>
        ) : null}
        {value?.url && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="min-h-[40px] font-body text-[11px] font-bold uppercase tracking-[.09em] text-danger"
          >
            Remove
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="m-0 mt-2 font-body text-[12.5px] font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** Decode just far enough to learn the intrinsic size, then release it. */
function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("not an image"))
    }
    img.src = url
  })
}
