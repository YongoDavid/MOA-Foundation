// Decorative play affordance. Purely visual: aria-hidden and pointer-events
// none per spec §11 — the surrounding card or player owns the interaction.
//
// Sizes and the CSS-triangle geometry are lifted from the mockups. The 66px
// variant is the one centred on the post player: white fill, violet triangle,
// drop shadow. The smaller ones sit bottom-right on thumbnails.

type Size = 26 | 30 | 44 | 66

const GEOMETRY: Record<
  Size,
  { bg: string; arrow: string; w: number; h: number; ml: number; shadow?: string }
> = {
  26: { bg: "rgba(15,22,38,.6)", arrow: "#fff", w: 8, h: 5, ml: 3 },
  30: { bg: "rgba(15,22,38,.62)", arrow: "#fff", w: 9, h: 6, ml: 3 },
  44: { bg: "rgba(15,22,38,.6)", arrow: "#fff", w: 13, h: 8, ml: 4 },
  66: {
    bg: "rgba(255,255,255,.94)",
    arrow: "var(--blog-violet-600)",
    w: 19,
    h: 12,
    ml: 5,
    shadow: "0 8px 30px rgba(15,22,38,.3)",
  },
}

export default function PlayBadge({ size = 44 }: { size?: Size }) {
  const g = GEOMETRY[size]
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: g.bg,
        boxShadow: g.shadow,
      }}
    >
      {/* CSS triangle — the mockups use this rather than an icon font. */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${g.w}px solid ${g.arrow}`,
          borderTop: `${g.h}px solid transparent`,
          borderBottom: `${g.h}px solid transparent`,
          marginLeft: g.ml,
        }}
      />
    </div>
  )
}
