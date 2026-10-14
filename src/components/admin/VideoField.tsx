"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { requestUpload } from "@/app/admin/posts/actions"
import { formatDuration } from "@/lib/blog-format"
import {
  MAX_VIDEO_BYTES,
  detectMp4Codec,
  validateUpload,
  type Mp4Codec,
} from "@/lib/uploads"
import type { MediaItem } from "@/lib/blog-types"

export type VideoValue = {
  src: string
  poster: MediaItem
  durationSeconds: number
  sizeBytes: number
}

/**
 * Attach a video to a post.
 *
 * The file goes straight from the device to Supabase — a Server Action body
 * is capped near 4.5MB on Vercel, so a 50MB upload could not cross our server
 * even in principle. The server only issues a ticket.
 *
 * Three things happen in the browser before anything is sent, because all
 * three are cheaper and kinder to get wrong locally:
 *
 *   1. SIZE. 50MB is the ceiling this Supabase plan permits; the message says
 *      what to do rather than only refusing.
 *   2. CODEC. See detectMp4Codec — an HEVC .mp4 plays for the author and not
 *      for most visitors, and nothing visible distinguishes it.
 *   3. DURATION AND POSTER, read from the file. Duration used to be typed by
 *      hand. The poster is a frame grabbed at ~1s, so every video has one
 *      without anyone remembering to make it.
 */
export default function VideoField({
  value,
  onChange,
  onClear,
}: {
  value: VideoValue | null
  onChange: (v: VideoValue) => void
  onClear: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [codec, setCodec] = useState<Mp4Codec | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function pick(file: File) {
    setError(null)
    setCodec(null)
    setProgress(0)
    setBusy(true)
    try {
      const local = validateUpload("video", {
        name: file.name,
        size: file.size,
        type: file.type,
      })
      if (!local.ok) {
        setError(local.error)
        return
      }

      // moov sits at the start of web-optimised files and at the end of most
      // camera recordings, so look at both rather than reading 50MB.
      setStage("Checking the file…")
      const head = new Uint8Array(await file.slice(0, 1_000_000).arrayBuffer())
      const tail = new Uint8Array(await file.slice(-1_000_000).arrayBuffer())
      const found = detectMp4Codec(head, tail)
      setCodec(found)

      setStage("Reading duration…")
      const probed = await probe(file)

      setStage("Uploading video…")
      const ticket = await requestUpload("video", {
        name: file.name,
        size: file.size,
        type: file.type,
      })
      if (!ticket.ok) {
        setError(ticket.error)
        return
      }
      await put(ticket.signedUrl, file, "video/mp4", setProgress)

      // The poster is best-effort: if the browser could not decode the video
      // it has no frame to give, and that is recoverable — a poster can be
      // uploaded by hand. Failing the whole upload over it would not be.
      let poster: MediaItem = value?.poster ?? { url: "", alt: "", width: 0, height: 0 }
      if (probed.posterBlob) {
        setStage("Saving the poster frame…")
        const pTicket = await requestUpload("image", {
          name: file.name.replace(/\.[^.]+$/, "") + "-poster.jpg",
          size: probed.posterBlob.size,
          type: "image/jpeg",
        })
        if (pTicket.ok) {
          await put(pTicket.signedUrl, probed.posterBlob, "image/jpeg", () => {})
          poster = {
            url: pTicket.publicUrl,
            alt: poster.alt,
            width: probed.width,
            height: probed.height,
          }
        }
      }

      onChange({
        src: ticket.publicUrl,
        poster,
        durationSeconds: probed.durationSeconds,
        sizeBytes: file.size,
      })
    } catch {
      setError("The upload did not finish. Check your connection and try again.")
    } finally {
      setBusy(false)
      setStage("")
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="border border-ink-900/[.16] p-4">
      <p className="m-0 mb-3 font-body text-[10.5px] font-bold uppercase tracking-[.14em] text-ink-400">
        Video file
      </p>

      {value?.src ? (
        <div className="mb-3 flex flex-col gap-4 sm:flex-row">
          <div className="relative h-[90px] w-[120px] flex-none overflow-hidden bg-sand-200">
            {value.poster.url ? (
              <Image src={value.poster.url} alt="" fill sizes="120px" className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="m-0 font-body text-[13px] font-semibold text-ink-900">
              {formatDuration(value.durationSeconds)} ·{" "}
              {(value.sizeBytes / 1024 / 1024).toFixed(1)}MB
            </p>
            <p className="m-0 mt-1 break-all font-body text-[11.5px] text-ink-500">
              {value.src.split("/").pop()}
            </p>
            <label className="mb-1 mt-3 block font-body text-[10px] font-bold uppercase tracking-[.12em] text-ink-400">
              Poster alt text — describe the still
            </label>
            <input
              value={value.poster.alt}
              onChange={(e) =>
                onChange({ ...value, poster: { ...value.poster, alt: e.target.value } })
              }
              placeholder="e.g. The delegation at the embassy, Abuja"
              className="min-h-[44px] w-full border border-ink-900/[.18] px-3 font-body text-[13.5px] text-ink-900 outline-none"
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void pick(f)
          }}
          className="w-full min-w-0 max-w-full font-body text-[12.5px] text-ink-600 file:mr-3 file:min-h-[40px] file:border file:border-ink-900/20 file:bg-paper file:px-4 file:font-body file:text-[11px] file:font-bold file:uppercase file:tracking-[.09em] file:text-ink-900"
        />
        {value?.src && !busy ? (
          <button
            type="button"
            onClick={onClear}
            className="min-h-[40px] font-body text-[11px] font-bold uppercase tracking-[.09em] text-danger"
          >
            Remove
          </button>
        ) : null}
      </div>

      {busy ? (
        <div className="mt-3">
          <p className="m-0 mb-1.5 font-body text-[12px] text-ink-600">
            {stage} {progress > 0 ? `${progress}%` : null}
          </p>
          <div className="h-1.5 w-full bg-sand-200">
            <div className="h-full bg-green-900 transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      {codec === "hevc" ? (
        <p className="m-0 mt-3 border-l-2 border-danger bg-panel px-4 py-3 font-body text-[12.5px] leading-[1.55] text-ink-700">
          <strong>This video is HEVC.</strong> It will play for you, and it
          will not play for most visitors using Chrome or Firefox — they will
          see a black rectangle. On an iPhone, set{" "}
          <em>Settings → Camera → Formats</em> to <em>Most Compatible</em> and
          record again, or re-export as H.264.
        </p>
      ) : null}

      <p className="m-0 mt-3 font-body text-[12px] leading-[1.5] text-ink-500">
        MP4, up to {Math.round(MAX_VIDEO_BYTES / 1024 / 1024)}MB. Videos are
        served from our own storage on a limited monthly allowance, so keep
        them short — a few minutes at 720p rather than full length at 1080p.
      </p>

      {error ? (
        <p role="alert" className="m-0 mt-2 font-body text-[12.5px] font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** PUT with progress. supabase-js cannot report it; XHR can. */
function put(
  url: string,
  body: Blob,
  contentType: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    xhr.setRequestHeader("content-type", contentType)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`upload failed: ${xhr.status}`))
    xhr.onerror = () => reject(new Error("network error"))
    xhr.send(body)
  })
}

/** Duration, dimensions and a frame, read from the file itself. */
function probe(file: File): Promise<{
  durationSeconds: number
  width: number
  height: number
  posterBlob: Blob | null
}> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement("video")
    v.preload = "metadata"
    v.muted = true
    // Required on iOS, which otherwise refuses to decode without a gesture.
    v.playsInline = true

    const done = (r: {
      durationSeconds: number
      width: number
      height: number
      posterBlob: Blob | null
    }) => {
      URL.revokeObjectURL(url)
      resolve(r)
    }

    v.onerror = () =>
      // Undecodable here — almost always HEVC on a browser without support.
      // The warning already covers why; carry on without a poster.
      done({ durationSeconds: 0, width: 0, height: 0, posterBlob: null })

    v.onloadedmetadata = () => {
      const durationSeconds = Number.isFinite(v.duration) ? v.duration : 0
      const width = v.videoWidth
      const height = v.videoHeight
      v.onseeked = () => {
        try {
          const scale = Math.min(1, 1600 / (width || 1600))
          const c = document.createElement("canvas")
          c.width = Math.round(width * scale)
          c.height = Math.round(height * scale)
          c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height)
          c.toBlob(
            (b) => done({ durationSeconds, width: c.width, height: c.height, posterBlob: b }),
            "image/jpeg",
            0.82,
          )
        } catch {
          done({ durationSeconds, width, height, posterBlob: null })
        }
      }
      v.currentTime = Math.min(1, durationSeconds / 2 || 0)
    }

    v.src = url
  })
}
