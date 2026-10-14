// Date formatting for the blog.
//
// Deliberately NOT Intl / toLocaleDateString: those resolve against the
// runtime's locale and timezone, which can differ between the server render
// and the client. That produces a hydration mismatch — the exact bug class
// fixed in NewsletterSection during the migration. Fixed month names are
// boring and correct.

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const

/**
 * `long`   -> "14 August 2026"  (featured card, post header)
 * `medium` -> "21 July"         (grid card author row)
 * `short`  -> "14 Aug"          (homepage block)
 */
export function formatDate(
  iso: string,
  style: "long" | "medium" | "short" = "long",
): string {
  // Parse the date parts directly rather than via `new Date(iso)`, which
  // applies a timezone offset and can shift the day across a boundary.
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number)
  const month = MONTHS[m - 1] ?? ""
  const day = String(d)
  if (style === "short") return `${day} ${month.slice(0, 3)}`
  if (style === "medium") return `${day} ${month}`
  return `${day} ${month} ${y}`
}

/** "CT" from "Comms Team", "GA" from "Grace A." — the avatar initials. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

/** "Gallery · 18 photos" / "Video · 2:41" — the badge and eyebrow suffix. */
export function mediaLabel(
  type: "gallery" | "video" | "story",
  opts: { count?: number; duration?: string } = {},
): string | null {
  if (type === "gallery" && opts.count) {
    return `Gallery · ${opts.count} photo${opts.count === 1 ? "" : "s"}`
  }
  if (type === "video" && opts.duration) return `Video · ${opts.duration}`
  if (type === "story") return "Story · No photos"
  return null
}

/** "1 comment" / "3 comments" — avoids the "1 comments" a client will notice. */
export function plural(count: number, singular: string, pluralForm?: string): string {
  return `${count} ${count === 1 ? singular : (pluralForm ?? `${singular}s`)}`
}

/**
 * Seconds to "m:ss". The duration used to be a free-text field an author
 * typed, which could say anything and frequently would. It is read from the
 * file now, so it only needs formatting.
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00"
  const total = Math.round(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

/**
 * The duration shown on a post CARD, derived from the post's first video.
 *
 * Cards read a post-level `videoDuration` string, and the editor has never
 * had a field for it — so every video post written in the admin showed a
 * bare "Video" with no running time, while the block beside it held the
 * exact number read from the file. Rather than add a box for someone to
 * mistype, take it from the block.
 *
 * Pure, and free of any `next/*` import, so a script can drive it.
 */
export function deriveVideoDuration(
  blocks: { kind: string; src?: string; durationSeconds?: number }[],
  fallback: string | null,
): string | null {
  const v = blocks.find(
    (b) => b.kind === "video" && typeof b.src === "string" && b.src.trim() !== "",
  )
  if (!v || !v.durationSeconds || v.durationSeconds <= 0) return fallback
  return formatDuration(v.durationSeconds)
}
