#!/usr/bin/env node
/**
 * Shrink the source photographs in src/Images.   node scripts/optimise-images.mjs
 *                                                node scripts/optimise-images.mjs --dry
 *
 * These are camera originals at up to 2560px. The widest the site ever lays an
 * image out is 1440px, so a 2400px longest edge still leaves headroom for a
 * high-density display and the rest was never going to be seen.
 *
 * WHY BOTHER, when next/image resizes on the fly? Because the originals sit in
 * git forever, every clone and every build pulls them, and the optimiser has
 * to decode a 2560px JPEG to produce a 640px one. Cheaper to store what is
 * actually needed.
 *
 * SAFE TO RE-RUN. Files already at or below the cap are re-encoded only if
 * that makes them smaller; otherwise they are left exactly as they are.
 * Everything is in git, so a bad result is one checkout away from undone.
 */
import sharp from "sharp"
import { readdirSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const DIR = "src/Images"
const MAX_EDGE = 2400
const QUALITY = 82
const DRY = process.argv.includes("--dry")

const files = readdirSync(DIR).filter((f) => /\.(jpe?g|png)$/i.test(f))
let before = 0
let after = 0
let touched = 0

for (const name of files) {
  const path = join(DIR, name)
  const original = statSync(path).size
  before += original

  const img = sharp(path, { failOn: "none" })
  const meta = await img.metadata()
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0)

  const pipeline = sharp(path, { failOn: "none" }).rotate() // honour EXIF orientation
  if (longest > MAX_EDGE) {
    pipeline.resize({
      width: meta.width >= meta.height ? MAX_EDGE : undefined,
      height: meta.height > meta.width ? MAX_EDGE : undefined,
      withoutEnlargement: true,
    })
  }

  const out = /\.png$/i.test(name)
    ? await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer()
    : await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer()

  // Never make a file bigger. A already-well-compressed image can grow when
  // re-encoded, and replacing it would be a loss in both senses.
  if (out.length >= original) {
    after += original
    console.log(`  kept    ${name}  (re-encode would be larger)`)
    continue
  }

  after += out.length
  touched++
  const pct = Math.round((1 - out.length / original) * 100)
  console.log(
    `  ${DRY ? "would " : ""}shrink ${name.padEnd(42)} ` +
      `${String(Math.round(original / 1024)).padStart(5)} KB -> ` +
      `${String(Math.round(out.length / 1024)).padStart(5)} KB  (-${pct}%)`,
  )
  if (!DRY) writeFileSync(path, out)
}

const mb = (n) => (n / 1024 / 1024).toFixed(1)
console.log(
  `\n  ${touched}/${files.length} files ${DRY ? "would change" : "changed"} · ` +
    `${mb(before)} MB -> ${mb(after)} MB (-${Math.round((1 - after / before) * 100)}%)`,
)
if (!DRY) {
  console.log("  Blog images also live in Supabase Storage — re-run")
  console.log("  `node scripts/seed-blog.mjs --force` to replace those copies.")
}
