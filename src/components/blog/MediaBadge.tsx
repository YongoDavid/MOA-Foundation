import { mediaLabel } from "@/lib/blog-format"

// The "Gallery · 18 photos" / "Video · 2:41" pill.
//
// Two treatments from the mockups:
//   solid — on a photo (featured hero, mobile featured): filled, white text
//   tint  — on white (post header chips): pale fill, coloured text
// Gallery is teal, video is amber (spec §3).

type Props = {
  kind: "gallery" | "video" | "story"
  count?: number
  duration?: string
  variant?: "solid" | "tint"
  className?: string
}

export default function MediaBadge({
  kind,
  count,
  duration,
  variant = "solid",
  className = "",
}: Props) {
  const label = mediaLabel(kind, { count, duration })
  if (!label) return null

  const isVideo = kind === "video"
  const accent = isVideo ? "#C99A45" : "#5B4A2E"
  const style =
    variant === "solid"
      ? { background: accent, color: "#fff" }
      : {
          background: isVideo ? "#F3EEE4" : "#F3EEE4",
          color: accent,
        }

  return (
    <span
      className={`inline-block px-[11px] py-[6px] text-[10px] font-bold uppercase leading-none tracking-[.1em] ${className}`}
      style={style}
    >
      {label}
    </span>
  )
}
