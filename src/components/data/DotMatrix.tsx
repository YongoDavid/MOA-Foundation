import { matrixMarks } from "@/lib/tokens"

// Lives-touched matrix (spec §6).
//
// Generated from data, never hand-written, so the graphic stays honest when
// the figure changes: matrixMarks(300, 10) yields 30 solid marks plus one pale
// mark carrying "and above".
//
// Mobile drops to EIGHT columns, not ten. With 31 marks, ten columns leaves the
// pale mark alone on a row of its own; eight gives three rows of eight and a
// final row of seven, so it ends a nearly-full row instead.
export default function DotMatrix({
  value,
  per = 10,
  caption,
}: {
  value: number
  per?: number
  /**
   * Required. Without a caption the graphic is decoration, not evidence.
   *
   * It no longer has to EXPLAIN the marks — the sr-only paragraph above
   * carries the full "N marks of ten, plus one for and above" reading, which
   * is where that detail actually matters. The visible line is free to say
   * what the figure means.
   */
  caption: string
}) {
  const marks = matrixMarks(value, per)
  const solid = marks.filter((m) => m === "full").length

  return (
    <div>
      <ul
        className="m-0 grid list-none grid-cols-8 gap-[5px] p-0 lg:grid-cols-16 lg:gap-1.5"
        style={{ maxWidth: 620 }}
        aria-hidden="true"
      >
        {marks.map((m, i) => (
          <li
            key={i}
            className={`aspect-square ${m === "full" ? "bg-umber-800" : "bg-sand-400"}`}
          />
        ))}
      </ul>
      {/* The graphic is decorative on its own; this is what makes it readable
          to assistive technology (spec §6). */}
      <p className="sr-only">
        {value} or more lives touched, shown as {solid} marks of {per} each,
        plus one mark for &ldquo;and above&rdquo;.
      </p>
      <p className="m-0 mt-4 max-w-[620px] font-body text-[11.5px] font-medium leading-[1.5] text-ink-600">
        {caption}
      </p>
    </div>
  )
}
