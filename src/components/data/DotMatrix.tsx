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
}: {
  value: number
  per?: number
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
      {/* Required caption. Without it the graphic is decoration, not evidence. */}
      <p className="m-0 mt-4 font-body text-[11.5px] font-medium leading-[1.5] text-ink-600">
        {solid} solid marks, {per} mentees each. The pale mark carries
        &ldquo;and above&rdquo; — the figure is reported as {value} or more.
      </p>
    </div>
  )
}
