"use client"

import { useId, useRef, useState } from "react"
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

const EMPTY_POSTER: MediaItem = { url: "", alt: "", width: 0, height: 0 }

/** Thrown when the author presses Cancel. Not a failure — do not report it as one. */
const ABORTED = "aborted-by-author"

/**
 * Attach a video to a post.
 *
 * The file goes straight from the device to Supabase — a Server Action body
 * is capped near 4.5MB on Vercel, so a 50MB upload could not cross our server
 * even in principle. The server only issues a ticket.
 *
 * Everything that can be decided locally is decided before a byte is sent,
 * because being wrong locally is free and being wrong after a four-minute
 * upload on mobile data is not:
 *
 *   1. SIZE. 50MB is the ceiling this Supabase plan permits; the refusal says
 *      what to do rather than only refusing.
 *   2. CODEC. An HEVC .mp4 plays for the author and not for most visitors.
 *      This STOPS the upload and asks — see the gate below.
 *   3. DURATION AND POSTER, read from the file. Duration used to be typed by
 *      hand. The poster is a frame grabbed early on, so every video has one
 *      without anyone remembering to make it.
 *
 * An upload in flight can be cancelled. Without that, picking the wrong file
 * means either waiting out the whole transfer or reloading the page, and
 * reloading the page loses the unsaved post.
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
  const [notice, setNotice] = useState<string | null>(null)
  const [codec, setCodec] = useState<Mp4Codec | null>(null)
  /** Set only while an HEVC file is waiting on the author's decision. */
  const [held, setHeld] = useState<File | null>(null)

  // A post may hold more than one video block, so this cannot be a literal —
  // duplicate ids would point every label at the first field.
  const altId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const cancelled = useRef(false)

  function reset() {
    setError(null)
    setNotice(null)
    setCodec(null)
    setHeld(null)
    setProgress(0)
    cancelled.current = false
  }

  function cancel() {
    cancelled.current = true
    xhrRef.current?.abort()
    setBusy(false)
    setStage("")
    setProgress(0)
    setHeld(null)
    setNotice("Upload cancelled. Nothing was saved.")
  }

  /** Everything up to the point where the author might have to decide. */
  async function pick(file: File) {
    reset()
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
    // camera recordings, so read both ends rather than the whole 50MB.
    setBusy(true)
    setStage("Checking the file…")
    let found: Mp4Codec = "unknown"
    try {
      const head = new Uint8Array(await file.slice(0, 1_000_000).arrayBuffer())
      const tail = new Uint8Array(await file.slice(-1_000_000).arrayBuffer())
      found = detectMp4Codec(head, tail)
    } catch {
      // Unreadable here means unreadable everywhere; let the upload attempt
      // produce the real error rather than inventing one.
    }
    setCodec(found)
    setBusy(false)
    setStage("")

    // THE GATE. An HEVC file is not refused — the author may know their
    // audience, or may be replacing something already published — but it does
    // not upload by itself. Spending 40MB of a 1GB bucket and several minutes
    // of someone's data on a file most visitors cannot play should be a
    // choice, made before the transfer rather than discovered after it.
    if (found === "hevc") {
      setHeld(file)
      return
    }
    await send(file)
  }

  /** The transfer itself. Reached directly, or from "Upload anyway". */
  async function send(file: File) {
    setHeld(null)
    setError(null)
    setNotice(null)
    setProgress(0)
    cancelled.current = false
    setBusy(true)
    try {
      setStage("Reading duration…")
      const probed = await probe(file)
      if (cancelled.current) return

      setStage("Uploading video…")
      const ticket = await requestUpload("video", {
        name: file.name,
        size: file.size,
        type: file.type,
      })
      if (cancelled.current) return
      if (!ticket.ok) {
        setError(ticket.error)
        return
      }
      await put(ticket.signedUrl, file, "video/mp4", setProgress, xhrRef)

      // The poster is best-effort: a browser that could not decode the video
      // has no frame to give, and that is recoverable — one can be uploaded
      // by hand. Failing the whole upload over it would not be.
      let poster: MediaItem = value?.poster ?? EMPTY_POSTER
      if (probed.posterBlob && !cancelled.current) {
        setStage("Saving the poster frame…")
        setProgress(0)
        const pTicket = await requestUpload("image", {
          name: file.name.replace(/\.[^.]+$/, "") + "-poster.jpg",
          size: probed.posterBlob.size,
          type: "image/jpeg",
        })
        if (pTicket.ok) {
          await put(pTicket.signedUrl, probed.posterBlob, "image/jpeg", setProgress, xhrRef)
          poster = {
            url: pTicket.publicUrl,
            alt: poster.alt,
            width: probed.width,
            height: probed.height,
          }
        }
      }
      if (cancelled.current) return

      onChange({
        src: ticket.publicUrl,
        poster,
        durationSeconds: probed.durationSeconds,
        sizeBytes: file.size,
      })
    } catch (e) {
      if (!(e instanceof Error && e.message === ABORTED)) {
        setError("The upload did not finish. Check your connection and try again.")
      }
    } finally {
      xhrRef.current = null
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
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative h-[108px] w-full flex-none overflow-hidden bg-sand-200 sm:h-[90px] sm:w-[120px]">
            {value.poster.url ? (
              <Image
                src={value.poster.url}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 120px"
                className="object-cover"
              />
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
            <label
              htmlFor={altId}
              className="mb-1 mt-3 block font-body text-[10px] font-bold uppercase tracking-[.12em] text-ink-400"
            >
              Poster alt text — describe the still
            </label>
            <input
              id={altId}
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

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4"
          disabled={busy || held !== null}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void pick(f)
          }}
          className="w-full min-w-0 max-w-full font-body text-[12.5px] text-ink-600 file:mr-3 file:min-h-[44px] file:border file:border-ink-900/20 file:bg-paper file:px-4 file:font-body file:text-[11px] file:font-bold file:uppercase file:tracking-[.09em] file:text-ink-900 disabled:opacity-50"
        />
        {value?.src && !busy ? (
          <button
            type="button"
            onClick={onClear}
            className="min-h-[44px] self-start font-body text-[11px] font-bold uppercase tracking-[.09em] text-danger sm:self-auto"
          >
            Remove
          </button>
        ) : null}
      </div>

      {busy ? (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <p className="m-0 font-body text-[12px] text-ink-600">
              {stage}
              {progress > 0 ? ` ${progress}%` : ""}
            </p>
            <button
              type="button"
              onClick={cancel}
              className="-my-2 min-h-[44px] flex-none px-1 font-body text-[11px] font-bold uppercase tracking-[.09em] text-danger"
            >
              Cancel
            </button>
          </div>
          <div className="h-1.5 w-full bg-sand-200">
            <div
              className="h-full bg-green-900 transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {codec === "hevc" ? (
        <div className="mt-4 border-l-2 border-danger bg-panel px-4 py-3">
          <p className="m-0 font-body text-[12.5px] leading-[1.55] text-ink-700">
            <strong>This video is HEVC, not H.264.</strong> It will play for
            you and it will not play for most visitors using Chrome or
            Firefox — they see a black rectangle with working controls. On an
            iPhone, set <em>Settings → Camera → Formats</em> to{" "}
            <em>Most Compatible</em> and record again, or re-export as H.264.
          </p>
          {held ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void send(held)}
                className="min-h-[44px] border border-ink-900 bg-ink-900 px-4 font-body text-[11px] font-bold uppercase tracking-[.09em] text-white"
              >
                Upload anyway
              </button>
              <button
                type="button"
                onClick={() => {
                  reset()
                  if (inputRef.current) inputRef.current.value = ""
                }}
                className="min-h-[44px] border border-ink-900/20 px-4 font-body text-[11px] font-bold uppercase tracking-[.09em] text-ink-900"
              >
                Choose another file
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="m-0 mt-3 font-body text-[12px] leading-[1.5] text-ink-500">
        MP4, up to {Math.round(MAX_VIDEO_BYTES / 1024 / 1024)}MB. Videos are
        served from our own storage on a limited monthly allowance, so keep
        them short — a few minutes at 720p rather than full length at 1080p.
      </p>

      {notice ? (
        <p className="m-0 mt-2 font-body text-[12.5px] text-ink-600">{notice}</p>
      ) : null}

      {error ? (
        <p role="alert" className="m-0 mt-2 font-body text-[12.5px] font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * PUT with progress, and abortable.
 *
 * supabase-js can do the upload but reports no progress, and a 50MB transfer
 * with no progress bar is indistinguishable from a frozen page. The handle is
 * parked in a ref so Cancel can reach it.
 */
function put(
  url: string,
  body: Blob,
  contentType: string,
  onProgress: (pct: number) => void,
  handle: { current: XMLHttpRequest | null },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    handle.current = xhr
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
    xhr.onabort = () => reject(new Error(ABORTED))
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

    let settled = false
    const done = (r: {
      durationSeconds: number
      width: number
      height: number
      posterBlob: Blob | null
    }) => {
      if (settled) return
      settled = true
      clearTimeout(watchdog)
      URL.revokeObjectURL(url)
      resolve(r)
    }

    // Seeking is not guaranteed to fire anything. Setting currentTime to a
    // value it already holds may raise no `seeked` at all, and a decoder can
    // simply stall — either way the promise would never settle and the
    // upload would sit at "Reading duration…" forever. Give up and carry on
    // without a poster; one can be uploaded by hand.
    const watchdog = setTimeout(
      () => done({ durationSeconds: 0, width: 0, height: 0, posterBlob: null }),
      10_000,
    )

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
      // Never 0 — a seek to the current position may fire nothing.
      const at = Math.min(1, durationSeconds / 2)
      if (at > 0) {
        v.currentTime = at
      } else {
        done({ durationSeconds, width, height, posterBlob: null })
      }
    }

    v.src = url
  })
}
