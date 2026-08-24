# Blog Plan 1 — CRA to Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the existing single-page MOA Foundation site from Create React App to Next.js App Router with no visible change to the site, establishing the server-rendering platform the blog spec requires.

**Architecture:** In-place migration on a feature branch. The twelve existing components in `src/components/` are not rewritten; they are wired into `src/app/` with correct client boundaries. Tailwind moves from CRA's implicit auto-detection to an explicit `postcss.config.mjs`. Google Fonts move from a CSS `@import` to `next/font`. The runtime favicon hack in `src/index.js` is replaced by Next's file-based icon convention.

**Verification strategy — no test framework, by project decision.** This project uses **no browser test harness and no unit test framework**. Verification is three layers:
1. **`next build`** — the primary automated gate. A missing `"use client"` is a hard build error; a `document` reference during prerender fails the build. Two of this plan's four defects cannot escape it.
2. **`scripts/smoke.sh`** — a dependency-free bash + `curl` + `grep` script asserting on the server-rendered HTML. This works only because the migration introduces SSR, and it is what proves SSR happened. It catches the `[object Object]` static-import regression, missing sections, and missing metadata.
3. **`docs/manual-qa-checklist.md`** — a written browser checklist for what layers 1 and 2 genuinely cannot reach: hydration warnings in the console, and interaction (modal, tabs, carousels, mobile menu). A human runs this before merge. It is not automated and this plan does not pretend it is.

**Tech Stack:** Next.js (App Router, latest 15.x or newer) · React 19.2.8 · Tailwind CSS 3.4.17 · framer-motion 12 · lucide-react · TypeScript (strict, `allowJs`) · Vercel

## Global Constraints

These apply to every task. Values come from `Blog Handoff Spec.dc.html` v1.0 (20 August 2026) and from decisions confirmed with the foundation on 20 and 24 August 2026.

- **No test framework.** Do not install Playwright, Jest, Vitest, Cypress, Testing Library, or any other test runner. Do not add a `test` script. Verification is `next build`, `scripts/smoke.sh`, and the manual checklist. This is a standing project decision, not an oversight to correct.
- **React version floor:** 19.2.3. Installed is 19.2.8. Do not downgrade.
- **Function components only.** Use `ref` as a normal prop; never `forwardRef`.
- **Design tokens are the existing site's, NOT the spec's §3 values.** Keep `royal-purple #6d28d9`, `teal #14b8a6`, `bright-orange #fb923c`, `dark-navy #0f172a`, `orange-accent #fb6b35`, `light-gray #e5e7eb`, `dark-gray #1f2937`, `medium-gray #6b7280`. Keep **Outfit** (`font-heading`) and **Inter** (`font-sans`). The spec's `#6C0FD6` / `#14A38B` / `#F97C1C` / `#0F1626` and Plus Jakarta Sans must **not** be introduced. Spec §3's geometry, spacing, type *scale* and shadows still apply to blog work in later plans.
- **Do not introduce new hues.** Any colour outside the list above requires sign-off.
- **Production domain:** `mosesofafricafoundation.org` (confirmed 24 August 2026).
- **Dev/prod port:** 3010. Port 3000 is occupied by an unrelated process on the developer machine.
- **TypeScript:** `strict: true` with `allowJs: true`. New blog code (Plans 2–4) is `.ts`/`.tsx`. Existing components stay `.js` and are not converted in this plan.
- **Pinned versions, established in Task 1 — do not change them:**
  - **Next.js 16.3.2.** Defaults to **Turbopack**. Consequences: CSS is emitted at `/_next/static/chunks/*.css` (unminified in dev, whitespace after `:`), not the classic `/_next/static/css/*.css`; and **`next lint` does not exist** on this version (see Task 7).
  - **TypeScript pinned to `5.9.3`.** TypeScript 7.x is ESM-only with no CJS `main`, which breaks `react-scripts`' legacy `resolve.sync` — CRA crashes the moment `tsconfig.json` exists. The pin can be revisited only after Task 7 removes CRA, and there is no reason to.
- **Environment note:** the `timeout` command is **not available** on this macOS machine (it ships as `gtimeout` via coreutils). Do not use `timeout` in verification commands. To avoid hanging, background long-running servers (`cmd > /tmp/log 2>&1 &`, then `sleep`) and clean up with `pkill -f "next dev"`.
- **No visible change to the site.** Interpreted as: no change to layout, copy, or component behaviour. Asset delivery (`next/image`) and document metadata (title, description, favicon, social cards) *are* expected to change — those are the point of Tasks 4 and 6.
- **Reuse, do not re-implement,** the header, footer and Donation call-to-action (spec §1).

## File Structure

| Path | Responsibility | Action |
|---|---|---|
| `next.config.mjs` | Next configuration | Create (T1) |
| `postcss.config.mjs` | Explicit Tailwind + autoprefixer wiring | Create (T1) |
| `tsconfig.json` | Strict TS, `allowJs`, `@/*` → `./src/*` | Create (T1) |
| `next-env.d.ts` | Next-generated type shims | Auto-generated (T1) |
| `scripts/smoke.sh` | Dependency-free SSR assertions | Create (T1), extend (T4, T6) |
| `docs/manual-qa-checklist.md` | Browser checks that cannot be automated | Create (T1) |
| `tailwind.config.js` | Tokens; content globs; font CSS vars | Modify (T1, T2) |
| `src/app/layout.jsx` | Root HTML shell, fonts, metadata | Create (T1), modify (T2, T6) |
| `src/app/page.jsx` | Homepage composition (replaces `src/App.js`) | Create (T1), modify (T3) |
| `src/app/globals.css` | Single Tailwind layer import + custom classes | Create minimal (T1), fill in (T2) |
| `.gitignore` | Ignore `/.next` build output | Modify (T1) |
| `src/app/icon.jpg` | Favicon via file convention | Create (T6) |
| `src/app/opengraph-image.jpg` | Social card image | Create (T6) |
| `src/components/ScrollToTopButton.js` | Add missing `"use client"` | Modify (T3) |
| `src/components/book-now-modal.js` | Guard `createPortal` behind mount | Modify (T3) |
| `src/components/Header.js` | Logo via `next/image` | Modify (T4) |
| `src/components/HeroSection.js` | Carousel via `next/image` | Modify (T4) |
| `src/components/AboutSection.js` | Carousel via `next/image` | Modify (T4) |
| `src/components/NewsletterSection.js` | Deterministic particles (hydration) | Modify (T5) |
| `public/manifest.json` | Real PWA manifest | Modify (T6) |
| `src/App.js`, `src/App.css`, `src/index.js`, `src/index.css`, `public/index.html` | Superseded | Delete (T7) |
| `package.json` | Scripts and dependencies | Modify (T1, T7) |
| `.env.example` | Env vars for Plans 2–4 | Create (T8) |

---

### Task 1: Next.js scaffold, smoke script, and manual QA checklist

Get a Next.js App Router shell building and serving a Tailwind-styled placeholder alongside the still-working CRA app, and establish both verification tools before any component is touched. CRA is not removed until Task 7, so everything here is reversible.

**Files:**
- Create: `next.config.mjs`, `postcss.config.mjs`, `tsconfig.json`
- Create: `src/app/layout.jsx`, `src/app/page.jsx`
- Create: `scripts/smoke.sh`, `docs/manual-qa-checklist.md`
- Modify: `tailwind.config.js` (content globs), `package.json` (add `next`, TS types, `dev` script)

**Interfaces:**
- Consumes: nothing.
- Produces: `npm run dev` serves Next on port 3010. Import alias `@/*` → `./src/*`. `bash scripts/smoke.sh [baseUrl]` exits 0 on success, 1 on any failed assertion, and is extended in Tasks 4 and 6.

**Why `postcss.config.mjs` is mandatory:** CRA enabled Tailwind implicitly by detecting `tailwind.config.js` (`useTailwind` in `react-scripts/config/webpack.config.js`). Next has no such detection. Without this file, every utility class silently stops working with no build error.

**Why `src/app` and not `app`:** the twelve components already live in `src/components`. Keeping the router under `src/` means no files move and `@/*` points at one root.

- [ ] **Step 1: Install Next.js and TypeScript**

```bash
npm install next
npm install --save-dev typescript @types/react @types/react-dom @types/node
```

- [ ] **Step 2: Create the Next config**

Create `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

export default nextConfig
```

- [ ] **Step 3: Create the PostCSS config**

Create `postcss.config.mjs`:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 4: Create the TypeScript config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

**The `.js`/`.jsx` globs are load-bearing.** Without them the TypeScript program contains no project files at all, so `strict: true` type-checks nothing and the build's "Running TypeScript" step is theatre. `checkJs` is deliberately left unset (defaults to `false`), so the twelve existing JS components are *resolved* into the program — giving correct import resolution and editor tooling — but are not error-checked. That satisfies spec §2's strict requirement for the `.ts`/`.tsx` blog code added in Plans 2–4 while honouring the constraint that existing components are not converted. Verify with `npm exec tsc -- --noEmit --listFiles | grep -c "src/"` — expect 14, not 0.

- [ ] **Step 5: Update the Tailwind content globs**

In `tailwind.config.js`, replace the `content` array. The old `./public/index.html` entry is dropped because that file is deleted in Task 7.

```js
content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
```

Leave `theme.extend.colors` and `theme.extend.fontFamily` untouched — fonts are rewired in Task 2.

- [ ] **Step 6: Create a minimal stylesheet and root layout**

Create `src/app/globals.css` with only the Tailwind layer directives. Task 2 replaces this file's contents with the full consolidated stylesheet; for now it exists purely so Tailwind has something to compile — without it, Step 11's `bg-royal-purple` check cannot pass because no stylesheet is emitted at all.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Create `src/app/layout.jsx`. Fonts and real metadata arrive in Tasks 2 and 6.

```jsx
import "./globals.css"

export const metadata = {
  title: "Moses of Africa Mentoring Foundation",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 7: Create a placeholder page that proves Tailwind works**

Create `src/app/page.jsx`. The `bg-royal-purple` class is the assertion: it renders purple only if the token config and PostCSS wiring are both correct.

```jsx
export default function Home() {
  return (
    <main className="min-h-screen bg-white p-10">
      <h1 className="font-heading text-3xl font-bold text-dark-navy">
        Next.js scaffold live
      </h1>
      <div className="mt-6 rounded-2xl bg-royal-purple p-6 text-white">
        Tailwind tokens resolve
      </div>
    </main>
  )
}
```

- [ ] **Step 8: Write the smoke script**

Create `scripts/smoke.sh`. Assertions are added to `PAGE_CONTAINS` in Tasks 4 and 6; the harness itself does not change again.

```bash
#!/usr/bin/env bash
# Dependency-free smoke check against a running Next server.
#
# Usage: bash scripts/smoke.sh [baseUrl]   (default http://localhost:3010)
#
# This asserts on SERVER-RENDERED HTML. It only passes if Next is actually
# server-rendering the page, which is the whole point of the migration.
# It cannot check interaction or hydration warnings — see
# docs/manual-qa-checklist.md for those.

set -uo pipefail

BASE="${1:-http://localhost:3010}"
FAILURES=0

html=$(curl -fsS --max-time 20 "$BASE/") || {
  echo "FATAL: could not fetch $BASE/ — is the server running?"
  exit 1
}

pass() { printf '  ok    %s\n' "$1"; }
fail() { printf '  FAIL  %s\n' "$1"; FAILURES=$((FAILURES + 1)); }

# Assert a literal string is present in the served HTML.
contains() {
  if printf '%s' "$html" | grep -qF -- "$2"; then pass "$1"; else fail "$1 (missing: $2)"; fi
}

# Assert a literal string is ABSENT from the served HTML.
absent() {
  if printf '%s' "$html" | grep -qF -- "$2"; then fail "$1 (found: $2)"; else pass "$1"; fi
}

# Assert the first URL in the HTML matching a pattern actually resolves to a
# resource of the expected content-type. Checking that a URL is *referenced*
# proves nothing — a broken image optimizer still emits the markup.
# $1 description, $2 grep pattern for the URL, $3 expected content-type prefix
resolves() {
  local url status ctype
  # Cut at the first space so srcset descriptors ("... 1x, ... 2x") are not
  # swallowed, and unescape &amp; back to & so the query string is valid.
  url=$(printf '%s' "$html" | grep -o "$2" | head -1 | sed 's/&amp;/\&/g')
  if [ -z "$url" ]; then fail "$1 (no URL matching $2 in page)"; return; fi
  status=$(curl -o /dev/null -s -w '%{http_code}' --max-time 20 "$BASE$url")
  ctype=$(curl -o /dev/null -s -w '%{content_type}' --max-time 20 "$BASE$url")
  if [ "$status" = "200" ] && case "$ctype" in "$3"*) true ;; *) false ;; esac; then
    pass "$1 ($status $ctype)"
  else
    fail "$1 (got status=$status type=$ctype; expected 200 $3*)"
  fi
}

echo "Smoke checking $BASE"

echo "-- scaffold"
contains "page renders"                 "Next.js scaffold live"

echo "-- regressions"
# Static image imports return an object under Next; a bare {import} in src
# serialises as "[object Object]". Vacuously true until Task 4 renders real
# images, then becomes the live canary for that whole class of regression.
absent   "no object-serialisation leak"  "[object Object]"

echo "-- stylesheet"
css_path=$(printf '%s' "$html" | grep -o '/_next/static/css/[^"]*\.css' | head -1)
if [ -z "$css_path" ]; then
  fail "stylesheet linked"
else
  pass "stylesheet linked"
  css=$(curl -fsS --max-time 20 "$BASE$css_path") || css=""
  if printf '%s' "$css" | grep -q '6d28d9'; then
    pass "brand token royal-purple compiled"
  else
    fail "brand token royal-purple compiled (Tailwind not processing config)"
  fi
  # Unprocessed directives in the STYLESHEET mean PostCSS is not wired up.
  # This must test the CSS, not the HTML — Next never inlines source CSS
  # text into markup, so checking the page body could never fail.
  if printf '%s' "$css" | grep -q '@tailwind'; then
    fail "no raw tailwind directives (PostCSS did not process the layers)"
  else
    pass "no raw tailwind directives"
  fi
  # Under CRA, preflight was emitted twice because index.css and App.css
  # each imported the Tailwind layers. Exactly one copy is required — a
  # regression to 2 is the specific bug this migration set out to fix, so
  # this gates on equality, not presence.
  # Dev-mode CSS (unminified) keeps a space after the colon; production
  # builds strip it. Tolerate both.
  boxsizing=$(printf '%s' "$css" | grep -Ec 'box-sizing:[[:space:]]*border-box' || true)
  if [ "$boxsizing" -eq 1 ]; then
    pass "preflight emitted exactly once"
  else
    fail "preflight emitted exactly once (found $boxsizing copies; expected 1)"
  fi
fi

echo
if [ "$FAILURES" -eq 0 ]; then
  echo "PASS — all checks green"
  exit 0
fi
echo "FAIL — $FAILURES check(s) failed"
exit 1
```

Make it executable:

```bash
chmod +x scripts/smoke.sh
```

- [ ] **Step 9: Write the manual QA checklist**

Create `docs/manual-qa-checklist.md`. This is the honest record of what automation does not cover.

```markdown
# Manual QA Checklist — Next.js migration

`scripts/smoke.sh` and `next build` cover server-rendered output and build
integrity. They cannot cover hydration warnings or interaction. Run this
list in a real browser before merging, at desktop width and at 390px.

## Console (the highest-value check)
- [ ] Open DevTools console, hard-reload `/`. **Zero errors.**
- [ ] Specifically: no "Hydration failed", no "server rendered HTML didn't match".
- [ ] Scroll to the bottom of the page. Still zero errors.

## Donation modal
- [ ] Header grid icon opens the drawer; heading reads "Donate Here".
- [ ] Desktop nav "DONATION" opens the same drawer (it is not an anchor).
- [ ] Mobile menu "Donate Now" opens it and closes the menu.
- [ ] Escape closes it. Clicking the backdrop closes it.
- [ ] While open, the page behind does not scroll.
- [ ] The name field is focused shortly after opening.

## Programs tabs
- [ ] "Specific Objectives" shows a two-column bullet list.
- [ ] "SDG Alignment" shows six SDG cards.
- [ ] "Core Values" shows five cards.
- [ ] The violet pill animates between tabs.

## Carousels
- [ ] Hero advances on its own roughly every 5s.
- [ ] Hero arrows (desktop) and dots both work.
- [ ] About-section carousel advances and its arrows work.
- [ ] Testimonials advance on their own; drag-swipe works on touch.

## Navigation
- [ ] Desktop "ABOUT US" / "PROGRAMS" / "CONTACT" scroll to the right sections,
      not hidden behind the sticky header.
- [ ] Mobile menu links smooth-scroll with the header offset applied.
- [ ] Scroll progress bar fills as the page scrolls.
- [ ] At 390px, the scroll-to-top button appears after ~300px and returns to top.

## Visual parity
- [ ] Compare against the pre-migration site side by side. Fonts, colours,
      spacing and image framing are unchanged.
- [ ] Favicon shows the MOA logo in the browser tab.
```

- [ ] **Step 10: Add the dev script**

In `package.json` `"scripts"`, add `dev` alongside the existing CRA scripts (do not remove `start` yet, and do not add a `test` script):

```json
"dev": "next dev -p 3010"
```

- [ ] **Step 11: Verify**

Start the dev server in the background, then run the smoke script:

```bash
npm run dev > /tmp/next-dev.log 2>&1 &
sleep 12
bash scripts/smoke.sh
```

Expected: `PASS — all checks green`.

Then confirm the production build compiles:

```bash
npm exec next build
```

Expected: build completes and lists `/` as a route.

Stop the background dev server when done: `kill %1` (or `pkill -f "next dev"`).

- [ ] **Step 12: Commit**

```bash
git add next.config.mjs postcss.config.mjs tsconfig.json next-env.d.ts \
  src/app/layout.jsx src/app/page.jsx scripts/smoke.sh \
  docs/manual-qa-checklist.md tailwind.config.js package.json package-lock.json
git commit -m "build: scaffold Next.js App Router with explicit Tailwind and smoke checks"
```

---

### Task 2: Global CSS consolidation and next/font wiring

Fold the two duplicated Tailwind layer imports into one, and replace the render-blocking Google Fonts `@import` with `next/font`, which self-hosts the files.

**Files:**
- Create: `src/app/globals.css`
- Modify: `src/app/layout.jsx`
- Modify: `tailwind.config.js` (`fontFamily` → CSS variables)

**Interfaces:**
- Consumes: `src/app/layout.jsx` from Task 1.
- Produces: `--font-inter` and `--font-outfit` CSS variables on `<body>`; `font-sans` and `font-heading` resolve through them. All custom classes from the old `App.css` (`gradient-orange`, `gradient-teal`, `gradient-dark`, `shadow-soft`, `shadow-medium`, `shadow-large`, `shadow-glow`) remain available.

**What changes and why:**
- `src/index.css` and `src/App.css` each imported `tailwindcss/base|components|utilities`, emitting preflight and the whole utility layer twice. One copy now.
- The hand-written `.text-royal-purple` / `.bg-royal-purple` / `.border-teal` duplicates are **kept**. `CTASection.js:74` builds `text-${card.color}` at runtime, which Tailwind's scanner cannot see; these rules are its safety net. Removing them is a separate, deliberate change — not part of a migration.

- [ ] **Step 1: Create the consolidated global stylesheet**

Create `src/app/globals.css` — the union of the old `index.css` and `App.css`, with one Tailwind layer import and no font `@import`.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom CSS variables — mirrored in tailwind.config.js theme.extend.colors */
:root {
  --color-royal-purple: #6d28d9;
  --color-teal: #14b8a6;
  --color-bright-orange: #fb923c;
  --color-light-gray: #e5e7eb;
  --color-dark-gray: #1f2937;
  --color-medium-gray: #6b7280;
}

body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Smooth scrolling for in-page navigation */
html {
  scroll-behavior: smooth;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace;
}

/* Safety net for runtime-composed class names (see CTASection.js:74) */
.text-royal-purple { color: var(--color-royal-purple); }
.text-teal { color: var(--color-teal); }
.text-bright-orange { color: var(--color-bright-orange); }
.text-dark-gray { color: var(--color-dark-gray); }
.text-medium-gray { color: var(--color-medium-gray); }

.bg-royal-purple { background-color: var(--color-royal-purple); }
.bg-teal { background-color: var(--color-teal); }
.bg-bright-orange { background-color: var(--color-bright-orange); }
.bg-light-gray { background-color: var(--color-light-gray); }

.border-royal-purple { border-color: var(--color-royal-purple); }
.border-teal { border-color: var(--color-teal); }
.border-bright-orange { border-color: var(--color-bright-orange); }

.gradient-orange { background: linear-gradient(135deg, #fb923c, #ff6b35); }
.gradient-teal { background: linear-gradient(135deg, #14b8a6, #0f766e); }
.gradient-dark { background: linear-gradient(135deg, #1f2937, #374151); }

.shadow-soft {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.shadow-medium {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.shadow-large {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.shadow-glow {
  box-shadow: 0 0 0 3px rgba(109, 40, 217, 0.1);
}
```

- [ ] **Step 2: Wire the fonts into the layout**

Replace the whole contents of `src/app/layout.jsx`:

```jsx
import { Inter, Outfit } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

export const metadata = {
  title: "Moses of Africa Mentoring Foundation",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Point the Tailwind font tokens at the CSS variables**

In `tailwind.config.js`, replace the `fontFamily` block inside `theme.extend`:

```js
fontFamily: {
  // The system stack after the webfont mirrors what src/index.css had on
  // `body` before the migration. next/font swaps Inter in once loaded, so
  // this chain is what renders during the swap window — dropping it to a
  // bare `sans-serif` would be a visible change on first paint.
  sans: [
    "var(--font-inter)",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Oxygen",
    "Ubuntu",
    "Cantarell",
    "Fira Sans",
    "Droid Sans",
    "Helvetica Neue",
    "sans-serif",
  ],
  heading: ["var(--font-outfit)", "sans-serif"],
},
```

The long stack is deliberate. `src/index.css` set exactly these eleven fallbacks on `body`; because `body` now takes its family from the `font-sans` class instead, the chain has to live here or it is silently lost. `heading` keeps the short stack because Outfit never had a system fallback.

- [ ] **Step 4: Verify**

```bash
npm run dev > /tmp/next-dev.log 2>&1 &
sleep 12
bash scripts/smoke.sh
```

Expected: `PASS`. The `preflight present` line should now report a **low** `box-sizing` count — under CRA the layer was emitted twice.

Then confirm the font variables actually reached the CSS:

```bash
CSS=$(curl -fsS http://localhost:3010/ | grep -o '/_next/static/css/[^"]*\.css' | head -1)
curl -fsS "http://localhost:3010$CSS" | grep -c 'font-inter'
```

Expected: at least `1`. A `0` means the Tailwind `fontFamily` rewrite did not take.

Stop the dev server: `pkill -f "next dev"`.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.jsx tailwind.config.js
git commit -m "style: consolidate global CSS to one Tailwind layer and self-host fonts"
```

---

### Task 3: Port the homepage composition and fix client boundaries

Wire the twelve existing components into `src/app/page.jsx` and fix the two component-level defects that break under server rendering.

**Files:**
- Modify: `src/app/page.jsx`
- Modify: `src/components/ScrollToTopButton.js:1`
- Modify: `src/components/book-now-modal.js:1-56`

**Interfaces:**
- Consumes: `src/app/layout.jsx` and `globals.css` from Task 2; all twelve components from `src/components/`.
- Produces: the full homepage at `/`, server-rendered.

**The two defects, and why they are real:**

1. **`ScrollToTopButton.js` has no `"use client"`** but calls `useState`, `useEffect` and framer-motion. Ten of the twelve components already carry the directive as an inert leftover from a Next.js/v0 origin — under Next it becomes meaningful again, and this is the one file that needs it and lacks it. Without it the build fails with "You're importing a component that needs `useState`". `Footer.js` also lacks it and correctly stays a server component: it imports only lucide-react SVG components and uses no hooks.

2. **`book-now-modal.js` calls `createPortal(..., document.body)` in the render body.** Client components still render on the server for the initial HTML, where `document` is undefined — this throws during prerender. It must be deferred until after mount.

- [ ] **Step 1: Add the missing client directive**

In `src/components/ScrollToTopButton.js`, add as the very first line, followed by a blank line:

```js
"use client"
```

- [ ] **Step 2: Guard the portal behind mount**

In `src/components/book-now-modal.js`, add after the existing `const nameRef = useRef(null)` line:

```js
  // createPortal needs document, which does not exist during server rendering.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
```

Then change the return statement from `return createPortal(` to:

```js
  if (!mounted) return null

  return createPortal(
```

- [ ] **Step 3: Port the page composition**

Replace the whole contents of `src/app/page.jsx`. This mirrors the old `src/App.js` exactly, including component order.

```jsx
import Header from "@/components/Header"
import HeroSection from "@/components/HeroSection"
import ProgramsSection from "@/components/ProgramsSection"
import AboutSection from "@/components/AboutSection"
import ScrollProgress from "@/components/ScrollProgress"
import PartnersStrip from "@/components/PartnersStrip"
import TestimonialsCarousel from "@/components/TestimonialsCarousel"
import NewsletterSection from "@/components/NewsletterSection"
import Footer from "@/components/Footer"
import ScrollToTopButton from "@/components/ScrollToTopButton"
import CTASection from "@/components/CTASection"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <ScrollProgress />
      <Header />
      <main>
        <HeroSection />
        <PartnersStrip />
        <ProgramsSection />
        <AboutSection />
        <TestimonialsCarousel />
        <CTASection />
        <NewsletterSection />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  )
}
```

- [ ] **Step 4: Verify the build catches nothing**

```bash
npm exec next build
```

Expected: build succeeds. If it fails with a `useState`/`useEffect` client-component error, Step 1 was not applied. If it fails with `document is not defined`, Step 2 was not applied.

- [ ] **Step 5: Verify the page server-renders**

```bash
npm run dev > /tmp/next-dev.log 2>&1 &
sleep 12
curl -fsS http://localhost:3010/ | grep -c "Emerging Leaders for"
curl -fsS http://localhost:3010/ | grep -c "Voices of Impact"
curl -fsS http://localhost:3010/ | grep -c 'id="about"'
```

Expected: each ≥ `1`. These strings appearing in raw `curl` output — with no JavaScript executed — is the proof that SSR is working.

The smoke script's `page renders` assertion still looks for the Task 1 placeholder string and will now FAIL. That is expected; Task 4 replaces it with the real assertions. Do not edit the script in this task.

Stop the dev server: `pkill -f "next dev"`.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.jsx src/components/ScrollToTopButton.js src/components/book-now-modal.js
git commit -m "feat: port homepage composition to App Router and fix SSR client boundaries"
```

---

### Task 4: Fix static image imports and switch the smoke script to real assertions

Under CRA, `import Logo1 from "../Images/Logo1.jpg"` yielded a URL string. Under Next it yields `{ src, width, height, blurDataURL }`, so every `<img src={...}>` fed by an import renders `[object Object]`. This task fixes all four call sites and points the smoke script at the real page.

**Files:**
- Modify: `src/components/Header.js:99`
- Modify: `src/components/book-now-modal.js:96`
- Modify: `src/components/HeroSection.js:80-87`
- Modify: `src/components/AboutSection.js:204-208`
- Modify: `scripts/smoke.sh` (replace the scaffold assertion with real ones)

**Interfaces:**
- Consumes: the ported page from Task 3.
- Produces: all four image call sites render real optimized URLs; `scripts/smoke.sh` asserts on the actual homepage and returns to green.

**Approach:** both carousels animate a wrapping `motion.div` that is already absolutely positioned, so `<Image fill>` slots in cleanly and the animation is untouched. **Never hardcode `width`/`height` for a statically imported image.** The import already carries the file's true intrinsic dimensions, and explicit props override them. `Logo1.jpg` is 1024x1536 (portrait, ratio 0.667); an earlier revision of this plan declared it 160x80 in `Header.js` and 160x160 in `book-now-modal.js` — the same file, two contradictory ratios, both wrong. Because `w-auto` plus a fixed height class makes the browser derive the box width from those attributes, the header got an 80px-wide box for a 27px-wide image and `objectFit: contain` letterboxed it, opening a gap that pushed the wordmark right. Omitting the props satisfies spec §2's layout-shift rule *and* makes the error impossible. Verify with `curl -fsS http://localhost:3010/ | grep -o '<img[^>]*alt="MOA Logo"[^>]*>'` — the emitted `width`/`height` must be `1024`/`1536`.

- [ ] **Step 1: Confirm the failure mode first**

```bash
npm run dev > /tmp/next-dev.log 2>&1 &
sleep 12
curl -fsS http://localhost:3010/ | grep -c "object Object"
```

Expected: a count ≥ `1`, proving the imports now serialise as objects.

- [ ] **Step 2: Fix the header logo**

In `src/components/Header.js`, add to the import block:

```js
import Image from "next/image"
```

Replace the `motion.img` on line 99:

```jsx
              {/* No width/height: Logo1 is a static import, so next/image reads
                  the real intrinsic size (1024x1536) at build time. Hardcoding
                  dimensions here would override that with a wrong aspect ratio
                  and letterbox the logo inside an oversized box. */}
              <Image
                src={Logo1}
                alt="MOA Logo"
                priority
                className={`w-auto transition-all duration-300 ${scrolled ? 'h-10 md:h-16' : 'h-12 md:h-20'}`}
                style={{ objectFit: 'contain' }}
              />
```

- [ ] **Step 3: Fix the modal logo**

In `src/components/book-now-modal.js`, add:

```js
import Image from "next/image"
```

Replace the `<img>` on line 96:

```jsx
                {/* No width/height — static import supplies the real 1024x1536. */}
                <Image src={Logo1} alt="MOA Logo" className="h-14 sm:h-32 md:h-40 w-auto" style={{ objectFit: 'contain' }} />
```

- [ ] **Step 4: Fix the hero carousel**

In `src/components/HeroSection.js`, add:

```js
import Image from "next/image"
```

Replace the `motion.img` block (lines 80–87). **The animation must be preserved.** That `motion.img` carries its own 20-second linear scale from 1 to 1.1 — a slow Ken Burns zoom, entirely separate from the parent `motion.div`'s 2-second entrance fade. Dropping to a plain `<Image>` would silently delete it, which is a visible change. Move the animation to a wrapper `motion.div` and put `<Image fill>` inside it:

```jsx
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.1 }}
              transition={{ duration: 20, ease: "linear", repeat: 0 }}
              className="absolute inset-0"
            >
              <Image
                src={heroImages[currentImage].src}
                alt={heroImages[currentImage].alt}
                fill
                priority={currentImage === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </motion.div>
```

Two details that matter:
- `priority` on the first slide only — it is the LCP element (spec §12). Remaining slides lazy-load.
- The wrapper needs `absolute inset-0` because `<Image fill>` positions itself against the nearest positioned ancestor. Without it the image collapses to zero height.

**Check the other three call sites for the same trap before converting them.** Only this one animates the image element itself. `Header.js:99` is a `motion.img` but carries no animation props — its hover scale lives on the parent `motion.div`, so a plain `<Image>` is a faithful swap. `book-now-modal.js:96` and `AboutSection.js:204` are plain `<img>` tags. Converting those three loses nothing.

- [ ] **Step 5: Fix the about carousel**

In `src/components/AboutSection.js`, add:

```js
import Image from "next/image"
```

Replace the `<img>` block (lines 204–208):

```jsx
                    <Image
                      src={aboutImages[currentImageIndex].src}
                      alt={aboutImages[currentImageIndex].alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
```

The `|| "/placeholder.svg"` fallbacks are removed in both carousels — `public/placeholder.svg` does not exist, so the fallback could only ever 404, and static imports cannot be undefined so it was unreachable.

- [ ] **Step 6: Point the smoke script at the real page**

In `scripts/smoke.sh`, replace this block:

```bash
echo "-- scaffold"
contains "page renders"                 "Next.js scaffold live"
```

with:

```bash
echo "-- sections server-rendered"
# Copy strings taken verbatim from the components. Apostrophes are avoided
# deliberately: the source mixes U+2019 (HeroSection) and U+0027
# (AboutSection), and "&" is HTML-escaped in the served markup.
contains "hero headline"                "Emerging Leaders for"
contains "programs heading"             "Aims"
contains "about heading"                "Future Leaders"
contains "testimonials heading"         "Voices of Impact"
contains "cta heading"                  "Get Involved"
contains "newsletter heading"           "Stay Connected with Our Community"
contains "foundation name"              "MOSES OF AFRICA MENTORING FOUNDATION"
contains "mission statement"            "MISSION STATEMENT:"

echo "-- anchor targets the nav depends on"
contains "anchor #about"                'id="about"'
contains "anchor #programs"             'id="programs"'
contains "anchor #community"            'id="community"'
contains "anchor #get-involved"         'id="get-involved"'
contains "anchor #newsletter"           'id="newsletter"'
contains "anchor #contact"              'id="contact"'

echo "-- images"
contains "logo alt text present"        'alt="MOA Logo"'
# next/image rewrites srcs through the optimizer; a raw /static/media path
# would mean the component is still using a bare <img>.
contains "images routed via optimizer"  "/_next/image"
# ...and the optimizer must actually return an image. A missing sharp binary
# or misconfigured optimizer still emits the markup above while every image
# on the page is broken, so the reference alone is not evidence.
resolves "optimizer serves real bytes"  '/_next/image?url=[^" ]*' "image/"
```

- [ ] **Step 7: Verify**

```bash
pkill -f "next dev"; npm run dev > /tmp/next-dev.log 2>&1 &
sleep 12
bash scripts/smoke.sh
```

Expected: `PASS — all checks green`, including `no object-serialisation leak`.

Then confirm the production build still compiles:

```bash
npm exec next build
```

Stop the dev server: `pkill -f "next dev"`.

- [ ] **Step 8: Commit**

```bash
git add src/components/Header.js src/components/book-now-modal.js \
  src/components/HeroSection.js src/components/AboutSection.js scripts/smoke.sh
git commit -m "fix: render images through next/image so static imports resolve"
```

---

### Task 5: Fix the hydration mismatch in NewsletterSection

`NewsletterSection.js:34-51` calls `Math.random()` for twenty floating particles during render. The server picks one set of values and the client another, so React reports a hydration mismatch. Under CRA there was no server render, so this was invisible.

**Files:**
- Modify: `src/components/NewsletterSection.js:1-11,33-54`

**Interfaces:**
- Consumes: nothing new.
- Produces: no hydration warning from this component. Particle animation is visually equivalent.

**Approach:** generate the particle values once, on the client, after mount. Rendering nothing on the server is correct — the particles are purely decorative `bg-white/10` dots, already hidden below `sm:`.

**Verification is manual for this task.** A hydration mismatch is a browser console warning; neither `next build` nor `curl` surfaces it. The check is the console section of `docs/manual-qa-checklist.md`, and it is the single most important line in that document.

- [ ] **Step 1: Confirm the mismatch in a browser**

Start the dev server, open `http://localhost:3010/` with DevTools open, and scroll to the newsletter section. Record the exact warning text — it will name a hydration mismatch. Paste it into the task report as the "before" evidence.

- [ ] **Step 2: Generate particles after mount**

In `src/components/NewsletterSection.js`, change the import on line 3 to include `useEffect`:

```js
import { useState, useRef, useEffect } from "react"
```

Add after the existing `const isInView = useInView(...)` line:

```js
  // Particle positions are random, so they must be generated on the client
  // only — computing them during render desyncs server and client HTML.
  const [particles, setParticles] = useState([])
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        dx: Math.random() * 100 - 50,
        dy: Math.random() * 100 - 50,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }))
    )
  }, [])
```

- [ ] **Step 3: Render from state instead of computing inline**

Replace the `{[...Array(20)].map(...)}` expression (lines 34–53) with:

```jsx
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/10 rounded-full"
                animate={{
                  x: [0, p.dx],
                  y: [0, p.dy],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: p.delay,
                }}
                style={{ left: p.left, top: p.top }}
              />
            ))}
```

- [ ] **Step 4: Verify in the browser**

Hard-reload with DevTools open. Expected: the warning recorded in Step 1 is gone, and the console is clean on load and after scrolling the full page. Record the "after" state in the task report.

Then confirm nothing else broke:

```bash
npm run dev > /tmp/next-dev.log 2>&1 &
sleep 12
bash scripts/smoke.sh
pkill -f "next dev"
```

Expected: `PASS`.

- [ ] **Step 5: Commit**

```bash
git add src/components/NewsletterSection.js
git commit -m "fix: generate newsletter particles after mount to avoid hydration mismatch"
```

---

### Task 6: Metadata API, favicon and social cards

Replace the runtime favicon hack with Next's file convention and give the site the description, canonical and social-card tags it has never had. This closes several gaps recorded in `CLAUDE.md`: five 404ing icon references, a misused meta tag where `name` held the foundation name and `content` held the tagline, and no Open Graph or Twitter tags at all.

**Files:**
- Create: `src/app/icon.jpg` (copied from `src/Images/Logo1.jpg`)
- Create: `src/app/opengraph-image.jpg` (copied from `src/Images/MOA.jpg`)
- Modify: `src/app/layout.jsx`
- Modify: `public/manifest.json`
- Modify: `scripts/smoke.sh` (add a metadata section)

**Interfaces:**
- Consumes: `src/app/layout.jsx` from Task 2.
- Produces: `<title>`, `<meta name="description">`, canonical, OG and Twitter tags on every route. Later plans extend this per-post via route-level `generateMetadata`.

- [ ] **Step 1: Copy the icon and social image into the app directory**

```bash
cp src/Images/Logo1.jpg src/app/icon.jpg
cp src/Images/MOA.jpg src/app/opengraph-image.jpg
```

Next serves these automatically and emits the corresponding `<link>` / `<meta>` tags. No manual tags needed.

- [ ] **Step 2: Write the full metadata block**

In `src/app/layout.jsx`, replace the `metadata` export. The domain is confirmed — `mosesofafricafoundation.org` — do not change it.

```jsx
export const metadata = {
  metadataBase: new URL("https://mosesofafricafoundation.org"),
  title: {
    default: "Moses of Africa Mentoring Foundation",
    template: "%s · Moses of Africa Mentoring Foundation",
  },
  description:
    "Moses of Africa Mentoring Foundation identifies and empowers young talent through mentorship, education, and leadership development across Africa.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Moses of Africa Mentoring Foundation",
    title: "Moses of Africa Mentoring Foundation",
    description:
      "Don't Just Belong, Stand Out. Mentorship, education and leadership development for Africa's emerging leaders.",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moses of Africa Mentoring Foundation",
    description:
      "Mentorship, education and leadership development for Africa's emerging leaders.",
  },
}
```

- [ ] **Step 3: Replace the boilerplate manifest**

Replace the whole contents of `public/manifest.json`. The old file named the app "Create React App Sample" and pointed at three icons that do not exist.

```json
{
  "short_name": "MOA Foundation",
  "name": "Moses of Africa Mentoring Foundation",
  "icons": [
    {
      "src": "/icon.jpg",
      "type": "image/jpeg",
      "sizes": "512x512"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#6d28d9",
  "background_color": "#ffffff"
}
```

- [ ] **Step 4: Add metadata assertions to the smoke script**

In `scripts/smoke.sh`, insert before the `echo "-- stylesheet"` line:

```bash
echo "-- document metadata"
# Anchored to the actual <title> tag and meta content attribute, NOT a bare
# substring: the same phrase and the word "mentorship" both already appear in
# rendered About-section body copy, so unanchored searches passed even with the
# entire metadata export deleted. Verified with negative controls.
contains "title tag"                    "<title>Moses of Africa Mentoring Foundation</title>"
contains "description meta"             'name="description"'
contains "description meta mentions mentorship" 'name="description" content="Moses of Africa Mentoring Foundation identifies and empowers young talent through mentorship'
contains "canonical link"               'rel="canonical"'
contains "canonical on prod domain"     "https://mosesofafricafoundation.org"
contains "og:title"                     'property="og:title"'
contains "og:image"                     'property="og:image"'
contains "twitter:card"                 'name="twitter:card"'
contains "favicon link"                 'rel="icon"'
# metadataBase must produce absolute URLs on the production domain. Under
# `next dev`, Next 16 resolves the opengraph-image FILE CONVENTION against the
# request origin, so og:image is legitimately http://localhost:3010/... — a
# dev-server artifact, not a misconfiguration. (canonical above is generated
# from metadataBase directly and IS correct in dev, which is why it stays
# ungated.) Enforcing this in dev would leave the script permanently one-check
# red, which teaches people to ignore red. So gate it behind an explicit flag:
#   SMOKE_PROD=1 bash scripts/smoke.sh   # against `next start`
if [ "${SMOKE_PROD:-0}" = "1" ]; then
  absent "no localhost in social tags"  'og:image" content="http://localhost'
else
  printf '  skip  no localhost in social tags (dev; use SMOKE_PROD=1 vs next start)\n'
fi
```

- [ ] **Step 5: Verify**

```bash
npm run dev > /tmp/next-dev.log 2>&1 &
sleep 12
bash scripts/smoke.sh
```

Expected: `PASS — all checks green`.

Confirm the favicon actually resolves rather than merely being linked:

```bash
ICON=$(curl -fsS http://localhost:3010/ | grep -o 'href="[^"]*icon[^"]*"' | head -1 | sed 's/href="//;s/"$//')
curl -o /dev/null -s -w "icon HTTP %{http_code}\n" "http://localhost:3010$ICON"
```

Expected: `icon HTTP 200`.

Stop the dev server: `pkill -f "next dev"`.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.jsx src/app/icon.jpg src/app/opengraph-image.jpg \
  public/manifest.json scripts/smoke.sh
git commit -m "feat: add real document metadata, favicon and social cards"
```

---

### Task 7: Decommission Create React App

Remove the CRA entrypoints and dependency now that Next serves the same page and the smoke script is green. This is the point of no return; everything before it was additive.

**Files:**
- Delete: `src/App.js`, `src/App.css`, `src/index.js`, `src/index.css`, `public/index.html`
- Modify: `package.json` (scripts, remove `react-scripts` and CRA-only deps)
- Create: `.eslintrc.json` (or `eslint.config.mjs` — see Step 4)

**Interfaces:**
- Consumes: a green smoke run from Task 6.
- Produces: `npm run dev`, `npm run build`, `npm start`, `npm run lint`. **Note the semantic change: under CRA `npm start` meant "dev server"; under Next it means "production server".**

- [ ] **Step 1: Delete the CRA entrypoints**

```bash
git rm src/App.js src/App.css src/index.js src/index.css public/index.html
```

`robots.txt` stays in `public/`. `manifest.json` stays — Next serves it from `public/` and Task 6 gave it real values.

- [ ] **Step 2: Remove react-scripts and unused CRA dependencies**

The `@testing-library/*` packages were never used — there are no test files and no `src/setupTests.js` — and this project uses no test framework by decision.

```bash
npm uninstall react-scripts @testing-library/dom @testing-library/jest-dom \
  @testing-library/react @testing-library/user-event web-vitals
```

- [ ] **Step 3: Replace the scripts block**

In `package.json`, replace `"scripts"` in full. Note there is deliberately no `test` script.

```json
  "scripts": {
    "dev": "next dev -p 3010",
    "build": "next build",
    "start": "next start -p 3010",
    "lint": "next lint",
    "smoke": "bash scripts/smoke.sh"
  },
```

Also delete the now-meaningless `"eslintConfig"` and `"browserslist"` blocks — both were CRA-specific. Next handles its own ESLint config and browser targets.

- [ ] **Step 4: Install ESLint with flat config**

**`next lint` does not exist in Next 16.** Verified against the installed Next 16.3.2 — its CLI offers only `build`, `dev`, `info`, `start`, `telemetry`, `typegen`, `upgrade` and some experimental commands. Do not use `next lint` and do not create `.eslintrc.json`; both are dead ends on this version. Use ESLint's flat config directly.

```bash
npm install --save-dev eslint eslint-config-next
```

Create `eslint.config.mjs`:

```js
import next from "eslint-config-next"

export default [
  ...next(),
  {
    ignores: [".next/**", "node_modules/**", "build/**"],
  },
]
```

The `@next/next/no-img-element` rule must be active — Step 5 relies on it to catch a `<img>` that Task 4 should have converted. Confirm it is by running `npm run lint` and checking the rule appears in output if you temporarily add a bare `<img>` somewhere; then revert that probe.

If `eslint-config-next` does not export a callable flat-config factory on the installed version, fall back to its documented flat-config shape for that version rather than reverting to `.eslintrc.json`. Record in the task report which shape you used.

- [ ] **Step 5: Verify lint, build and smoke**

```bash
npm run lint
npm run build
npm run dev > /tmp/next-dev.log 2>&1 &
sleep 12
npm run smoke
pkill -f "next dev"
```

Expected: lint reports no errors; build succeeds and lists `/` as a route; smoke reports `PASS`.

If lint flags `@next/next/no-img-element`, that is a genuine leftover `<img>` — Task 4 should have converted all four. Fix it rather than disabling the rule.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "build: remove Create React App, Next.js is now the only build"
```

---

### Task 8: Verify the production build and update project documentation

Confirm the migrated site behaves in a production build, and correct the documentation that now describes a stack this project no longer uses.

**Files:**
- Create: `.env.example`
- Modify: `CLAUDE.md` (**gitignored — edit it, but never `git add` it**)

**Interfaces:**
- Consumes: the completed migration.
- Produces: a verified production build. No `vercel.json` is needed — Vercel detects Next.js natively and handles deep links through the framework, which is a whole class of routing config the CRA setup would have required for the blog.

- [ ] **Step 1: Run the smoke script against a production build**

```bash
npm run build
npm start > /tmp/next-prod.log 2>&1 &
sleep 16
SMOKE_PROD=1 npm run smoke
pkill -f "next start"; pkill -f "next-server"
```

Expected: `PASS — all checks green`, with the `no localhost in social tags` check **enforced** rather than skipped. That gate only runs under `SMOKE_PROD=1`; see Task 6 for why. This catches anything that only works in dev — most often a client/server boundary that dev tolerates.

- [ ] **Step 2: Confirm canonical and OG URLs resolve against the confirmed domain**

With the production server running:

```bash
curl -fsS http://localhost:3010/ | grep -o '<link rel="canonical"[^>]*>'
curl -fsS http://localhost:3010/ | grep -o '<meta property="og:image"[^>]*>'
```

Expected: canonical is `https://mosesofafricafoundation.org/`, and `og:image` is absolute on that same host — not relative, not `localhost`.

- [ ] **Step 3: Document the environment variables Plans 2–4 need**

Create `.env.example`:

```
# Public site URL — drives canonical and Open Graph URLs (see src/app/layout.jsx)
NEXT_PUBLIC_SITE_URL=https://mosesofafricafoundation.org

# Supabase (Plan 2 onward)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudinary (Plan 4)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

- [ ] **Step 4: Update CLAUDE.md**

Its Commands, Stack, Styling and Assets sections describe CRA and are now actively misleading. Apply these edits:

- **Commands:** replace the CRA block with `npm run dev` (port 3010), `npm run build`, `npm start`, `npm run lint`, `npm run smoke`. State that `npm start` now means production server, and that this project has **no test framework** — verification is `next build`, `scripts/smoke.sh`, and `docs/manual-qa-checklist.md`.
- **Stack:** "Next.js App Router · React 19 · Tailwind CSS 3.4 · framer-motion 12 · lucide-react · TypeScript (strict, allowJs)".
- **Styling mechanics:** delete the paragraph about Tailwind being enabled by `tailwind.config.js` detection — that was CRA behaviour. Replace with: Tailwind is wired explicitly through `postcss.config.mjs`; the duplicated layer imports are gone; fonts come from `next/font` and resolve through `--font-inter` / `--font-outfit`.
- **Assets:** replace the "public/ is still CRA boilerplate" section — icons and manifest are fixed, and images go through `next/image`.
- **Conventions:** `"use client"` is no longer inert. It is load-bearing on all eleven client components; only `Footer.js` is a server component.
- Remove from "Content status" the items now resolved: missing icons, boilerplate manifest, absent description/OG tags.

Leave the still-true items: placeholder testimonials, disagreeing contact details, the three name variants, dead `href="#"` links, stub forms.

- [ ] **Step 5: Run the manual QA checklist**

Work through `docs/manual-qa-checklist.md` in a real browser at desktop width and 390px. **The console section is the priority** — it is the only check that can catch a hydration mismatch. Record the result in the task report; if any item fails, stop and report rather than proceeding to the pull request.

- [ ] **Step 6: Push the branch and open a pull request**

```bash
git add .env.example
git commit -m "docs: add env template for the Next.js stack"
git push -u origin feat/nextjs-migration
gh pr create --title "Migrate to Next.js App Router" --body "Platform migration ahead of the blog build. No visible change to the site. Verified by next build, scripts/smoke.sh (dev and production), and docs/manual-qa-checklist.md."
```

`CLAUDE.md` is gitignored and must not be staged. Confirm with `git status` that it does not appear.

- [ ] **Step 7: Verify the Vercel preview deployment**

Wait for the preview URL, then check by hand:

1. `bash scripts/smoke.sh <preview-url>` reports `PASS`.
2. View source: the section headings appear in the **initial HTML**, not only after JS runs. This is the whole point of the migration — confirm it.
3. The `<link rel="icon">` href returns 200.
4. Paste the preview URL into a link-preview checker; the OG card renders with title, description and image.

---

## Self-Review

**Spec coverage for this plan's scope.** This plan implements platform prerequisites only. Against the spec: §2's React conventions (19.2.8, function components, ref-as-prop) are satisfied by existing code and locked in Global Constraints. §2's server-rendering requirement is what the plan delivers, and `scripts/smoke.sh` is what proves it. §2's TypeScript requirement is set up in Task 1 and applies to blog code in later plans. §2's image rules are partially delivered in Task 4 via `next/image`; AVIF and the 480/960/1440 widths for *blog* media are Plan 4's pipeline. §12's per-post metadata, canonical, OG and JSON-LD are scaffolded in Task 6 and extended per-route in Plan 2. Everything else — §§1, 4–11, 13 — belongs to Plans 2–4 and is deliberately absent.

**Known coverage limits, stated rather than hidden:**
- **No automated interaction coverage.** The donation modal, programs tabs, three carousels and mobile menu are verified only by `docs/manual-qa-checklist.md`. A regression in any of them will not be caught by CI. This is the accepted cost of the no-test-framework decision.
- **No automated hydration check.** Task 5's fix is verified by reading the browser console. `next build` and `curl` cannot see hydration warnings.
- **No before/after visual baseline.** CRA renders nothing without JS, so no server-side "before" snapshot was obtainable. Visual parity is a human side-by-side comparison.
- Spec §11 `prefers-reduced-motion` is not addressed for the existing homepage. The plan promises no visible change, and adding motion suppression *is* a visible change. Logged as follow-up.
- Acceptance criterion 10 (Lighthouse ≥90 / accessibility 100) is measured on blog routes, so it is verified in Plan 2. Task 4's `next/image` conversion is the groundwork.

**Placeholder scan:** clean. The former `metadataBase` placeholder was resolved to `mosesofafricafoundation.org` on 24 August 2026 and is a fixed value in Task 6. Every code step carries its actual code.

**Type consistency:** component and prop names match the source exactly — `BookNowModal` takes `isOpen`/`onClose`; `ScrollToTopButton` takes `threshold`/`minContentRatio`. The `@/*` alias is defined once in Task 1 and used from Task 3. The `particles` shape declared in Task 5 Step 2 (`dx`, `dy`, `duration`, `delay`, `left`, `top`) is the shape consumed in Step 3. `scripts/smoke.sh` defines `contains` and `absent` in Task 1; Tasks 4 and 6 only add calls to them.

---

## Open questions blocking later plans

Carried from spec §14, plus two the codebase raises. None block Plan 1.

1. ~~**Production domain**~~ — **RESOLVED 24 Aug 2026:** `mosesofafricafoundation.org`.
2. **Which Supabase project / region**, and confirmation that Supabase + Cloudinary is approved rather than Payload.
3. **Is Publish ever scheduled**, or always immediate? Changes the `Post.status` union in spec §6.
4. **Do staff need email notification** when a comment arrives?
5. **Are categories fixed** (Mentorship, Education, Outreach, Partnerships) or staff-editable? Fixed means a union type; editable means a table.
6. **Second language at launch?** If yes, routing changes shape before Plan 2 starts — the most expensive question to answer late.
7. **Staff identity** — how do the two or three staff accounts get created? Supabase invite, or self-signup with an allowlist?

---

## Roadmap — Plans 2 to 4

Written after Plan 1 lands, so each can assume a known platform. All three inherit the no-test-framework constraint: verification is `next build`, extensions to `scripts/smoke.sh`, and additions to `docs/manual-qa-checklist.md`.

**Plan 2 — Public read surfaces (spec 1a, 1b, 1d).** Routes `/blog`, `/blog/page/:n`, `/blog/category/:slug`, `/blog/:slug`, plus `LatestPostsBlock` on `/`. Supabase schema for posts, categories and media; server components reading directly. Components from spec §4: `BlogIndex`, `FeaturedPost`, `RecentList`, `PostCard`, `CategoryChips`, `MediaBadge`, `PlayBadge`, `PostHeader`, `PostBody`, `GalleryGrid`, `Lightbox`, `VideoPlayer`, `PullQuote`, `LatestPostsBlock`. Delivers acceptance criteria 1–5, 9, 10. Also un-comments the `BLOG` nav item in `Header.js:24` and adds it to `Footer.js` quick links.

**Plan 3 — Comments (spec §8).** `CommentThread`, `CommentForm`, `Comment`. Supabase table with RLS enforcing that staff-only Delete is absent from the public payload, not merely hidden — the mechanism criterion 7 requires. `useActionState` for submit, `useOptimistic` for instant append, honeypot, 60-second per-IP throttle, 2000-character cap, link stripping, cursor pagination at three per page, one nesting level, and the "Comment removed" tombstone from the §8 warning. Delivers criteria 6 and 7.

**Plan 4 — Editor, auth and media (spec 1c, §9).** Supabase Auth with a staff role; `/admin/blog/new` and `/admin/blog/:id/edit` gated in middleware. `PostEditor`, `MediaDropzone`, `RichTextEditor`, `CardPreview`. Cloudinary upload with per-file progress, 200 MB cap, MP4 transcode with poster extraction and the "processing" state, required alt text before publish, 30-second autosave. Delivers criterion 8.
