// Design tokens that cannot live in Tailwind — the photographic scrims.
//
// Spec v2.0 §2: "Every photograph carrying text over it uses one of exactly
// three scrims, on a child element with pointer-events:none." Exported as
// constants so no component hand-writes a gradient and drifts.

export const SCRIM = {
  /** Desktop hero, 400–600px tall. */
  hero:
    "linear-gradient(94deg, rgba(20,16,24,.94) 0%, rgba(20,16,24,.74) 44%, rgba(20,16,24,.2) 100%)",
  /** Desktop section header, exactly 210px. */
  sectionHeader:
    "linear-gradient(90deg, rgba(20,16,24,.9) 0%, rgba(20,16,24,.55) 60%, rgba(20,16,24,.25) 100%)",
  /** Mobile hero and mobile section header — vertical. */
  mobile:
    "linear-gradient(180deg, rgba(20,16,24,.4), rgba(20,16,24,.92))",
  /** Card and tile badges — shorter, bottom-only. */
  badge:
    "linear-gradient(180deg, rgba(20,16,24,0), rgba(20,16,24,.8))",
  /** Post hero cards — transparent to .9 from 34–36%. */
  postCard:
    "linear-gradient(180deg, rgba(20,16,24,0) 35%, rgba(20,16,24,.9) 100%)",
} as const

/**
 * The Foundation's evidence figures, reported as at August 2026.
 *
 * Client-corrected. Earlier drafts carried 500+ lives, 50+ mentors and
 * "10+ countries reached" — all three were wrong. The country count in
 * particular must never come back: international reach is a future claim,
 * not a current one. The third stat is where we work, not how many places.
 *
 * Single source for both the homepage evidence band and the About record.
 */
export const EVIDENCE = {
  livesTouched: 300,
  mentors: 10,
  basedIn: "NIGERIA",
  sdgAddressed: [1, 2, 4, 5, 8, 9, 16] as const,
  sdgTotal: 17,
  asOf: "August 2026",
} as const

/**
 * One solid mark per `per` people, plus a single pale mark carrying
 * "and above" — the figure is reported as N or more, not exactly N.
 * Generated from data so the graphic stays honest when the figure changes.
 */
export function matrixMarks(
  value: number,
  per = 10,
): ("full" | "partial")[] {
  const full = Math.floor(value / per)
  return [...Array.from({ length: full }, () => "full" as const), "partial"]
}
