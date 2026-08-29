#!/usr/bin/env node
/**
 * Fail if any static asset import does not match what git records, case-exactly.
 *
 * WHY THIS EXISTS. macOS is case-insensitive; Vercel's Linux is not. Five
 * images were renamed .JPG -> .jpg on disk, but the rename never reached the
 * git index. Locally every import resolved and `next build` passed. On Vercel
 * the same commit failed with "Module not found: Can't resolve
 * '@/Images/c5c051a9-….jpg'", because git was still serving the .JPG name.
 *
 * `next build` on a Mac structurally cannot catch this — it asks the
 * filesystem, and the filesystem says yes. So the check has to compare
 * imports against `git ls-files`, which is what Vercel actually clones.
 *
 * Runs as `prebuild`, so `npm run build` is a real gate for it locally.
 */
import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const tracked = new Set(
  execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(Boolean),
)

const sources = execSync(
  "git ls-files 'src/**/*.ts' 'src/**/*.tsx' 'src/**/*.js' 'src/**/*.jsx'",
  { encoding: "utf8" },
).split("\n").filter(Boolean)

const IMPORT = /from\s+["']([^"']+\.(?:jpg|jpeg|png|gif|svg|webp|avif))["']/gi
const problems = []
let checked = 0

for (const file of sources) {
  const text = readFileSync(path.join(ROOT, file), "utf8")
  for (const m of text.matchAll(IMPORT)) {
    const spec = m[1]
    checked++
    let target
    if (spec.startsWith("@/")) target = path.posix.join("src", spec.slice(2))
    else if (spec.startsWith(".")) {
      target = path.posix.normalize(path.posix.join(path.posix.dirname(file), spec))
    } else continue // bare package import
    if (!tracked.has(target)) {
      const near = [...tracked].find((t) => t.toLowerCase() === target.toLowerCase())
      problems.push(
        `  ${file}\n    imports ${spec}\n    -> ${target}\n    ` +
          (near
            ? `git records this as "${near}" — a case mismatch that only fails on Linux`
            : "no such file is tracked by git"),
      )
    }
  }
}

if (problems.length) {
  console.error(
    `\nAsset case check FAILED — ${problems.length} import(s) will not resolve on a\n` +
      `case-sensitive filesystem (Vercel), even though they resolve on macOS:\n`,
  )
  console.error(problems.join("\n\n"))
  console.error(
    `\nFix by correcting the git index, not just the disk:\n` +
      `  git rm --cached src/Images/NAME.JPG && git add src/Images/NAME.jpg\n`,
  )
  process.exit(1)
}
console.log(`asset case check: ${checked} static asset import(s) resolve case-exactly`)
