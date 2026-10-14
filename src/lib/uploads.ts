/**
 * Upload rules and storage keys.
 *
 * NO next/* IMPORTS. Same rule as comments.ts and mail.ts: logic reachable
 * only through a browser is logic only a browser can test, and this project
 * has shipped broken forms that way twice. scripts/check-uploads.mjs drives
 * this module directly.
 *
 * WHY UPLOADS DO NOT GO THROUGH THE SERVER. A Server Action's request body is
 * capped at 1MB by default and at roughly 4.5MB by Vercel regardless of
 * config, so the bytes cannot cross our server at all. The browser sends the
 * file straight to Supabase; the server only issues a short-lived ticket
 * saying it may.
 *
 * That also fixes a bug that was already live: the previous path allowed 10MB
 * images through a Server Action, so any photo between ~4.5MB and 10MB failed
 * in production while working locally. No image in the repo is that large
 * after optimisation, but a full-resolution camera photo commonly is.
 */

export const BUCKET = "blog-media"

/**
 * Video lives in its own bucket so the two size limits stay meaningful and,
 * more importantly, so video egress is measurable on its own. The plan allows
 * 5 GB a month and video is served straight to the visitor.
 */
export const VIDEO_BUCKET = "blog-video"

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

/**
 * 50 MB, and it is a hard ceiling rather than a preference: this Supabase
 * plan refused a 100 MB and a 200 MB bucket limit outright. Larger recordings
 * must be re-exported — the client accepted that on 14 Oct 2026.
 */
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024

export const VIDEO_TYPES = ["video/mp4"] as const

export const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const

export type UploadKind = "image" | "video"

export type FileMeta = { name: string; size: number; type: string }

export function bucketFor(kind: UploadKind): string {
  return kind === "video" ? VIDEO_BUCKET : BUCKET
}

export type UploadCheck = { ok: true } | { ok: false; error: string }

export function validateUpload(kind: UploadKind, file: FileMeta): UploadCheck {
  if (!file.name) return { ok: false, error: "That file has no name." }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false, error: "That file is empty." }
  }
  if (kind === "video") {
    if (!(VIDEO_TYPES as readonly string[]).includes(file.type)) {
      return { ok: false, error: "MP4 video only." }
    }
    if (file.size > MAX_VIDEO_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(0)
      return {
        ok: false,
        error:
          `That video is ${mb}MB. The limit is 50MB — re-export it at a lower ` +
          `resolution or bitrate (720p is usually plenty) and try again.`,
      }
    }
    return { ok: true }
  }

  if (kind === "image") {
    if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return { ok: false, error: "Images only — JPEG, PNG, WebP or AVIF." }
    }
    if (file.size > MAX_IMAGE_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1)
      return {
        ok: false,
        error: `That image is ${mb}MB. The limit is 10MB — export it smaller and try again.`,
      }
    }
  }
  return { ok: true }
}

/**
 * Where the file lands.
 *
 * A time prefix, because two posts can legitimately both have a cover.jpg and
 * the second must not silently replace the first. The original name is kept
 * after it so a human browsing the bucket can still tell what things are.
 */
export function storageKey(kind: UploadKind, filename: string): string {
  const safe = filename
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-60)
  return `${kind === "image" ? "posts" : "video"}/${Date.now().toString(36)}-${safe}`
}

/** Minimal shape of the Supabase storage bucket API, so a test can fake it. */
export type SignedUrlIssuer = {
  storage: {
    from: (bucket: string) => {
      createSignedUploadUrl: (
        path: string,
      ) => Promise<{
        data: { signedUrl: string; token: string; path: string } | null
        error: { message: string } | null
      }>
      getPublicUrl: (path: string) => { data: { publicUrl: string } }
    }
  }
}

export type Ticket =
  | { ok: true; path: string; token: string; publicUrl: string }
  | { ok: false; error: string }

/**
 * Issue a one-shot ticket for the browser to upload against.
 *
 * The token is the authorisation, which is why the browser can use the
 * publishable key for the actual PUT — it is not trusted, the token is, and
 * only a signed-in admin can obtain one.
 */
export async function createUploadTicket(
  client: SignedUrlIssuer,
  kind: UploadKind,
  file: FileMeta,
): Promise<Ticket> {
  const check = validateUpload(kind, file)
  if (!check.ok) return { ok: false, error: check.error }

  const path = storageKey(kind, file.name)
  const bucket = client.storage.from(bucketFor(kind))
  const { data, error } = await bucket.createSignedUploadUrl(path)

  if (error || !data) {
    console.error("[createUploadTicket]", error?.message)
    return { ok: false, error: "Could not start the upload. Please try again." }
  }

  return {
    ok: true,
    path: data.path,
    token: data.token,
    publicUrl: bucket.getPublicUrl(data.path).data.publicUrl,
  }
}
