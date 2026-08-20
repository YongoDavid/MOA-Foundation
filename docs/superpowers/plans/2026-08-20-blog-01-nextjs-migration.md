# Blog Plan 1 — CRA to Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the existing single-page MOA Foundation site from Create React App to Next.js App Router with no visible change to the site, establishing the server-rendering platform the blog spec requires.

**Architecture:** In-place migration on a feature branch. Playwright characterization tests are written against the current CRA app *first* to capture existing behaviour, then must pass unchanged against Next.js — that suite is the definition of "no regression." The existing twelve components in `src/components/` are not rewritten; they are wired into `src/app/` with correct client boundaries. Tailwind moves from CRA's implicit auto-detection to an explicit `postcss.config.mjs`. Google Fonts move from a CSS `@import` to `next/font`. The runtime favicon hack in `src/index.js` is replaced by Next's file-based icon convention.

**Tech Stack:** Next.js (App Router, latest 15.x or newer) · React 19.2.8 · Tailwind CSS 3.4.17 · framer-motion 12 · lucide-react · TypeScript (strict, `allowJs`) · Playwright · Vercel

## Global Constraints

These apply to every task in this plan. Values are copied from `Blog Handoff Spec.dc.html` v1.0 (20 August 2026) and from decisions confirmed with the foundation on 20 August 2026.

- **React version floor:** 19.2.3. Installed is 19.2.8. Do not downgrade.
- **Function components only.** Use `ref` as a normal prop; never `forwardRef`.
- **Design tokens are the existing site's, NOT the spec's §3 values.** Confirmed decision: keep `royal-purple #6d28d9`, `teal #14b8a6`, `bright-orange #fb923c`, `dark-navy #0f172a`, `orange-accent #fb6b35`, `light-gray #e5e7eb`, `dark-gray #1f2937`, `medium-gray #6b7280`. Keep **Outfit** (`font-heading`) and **Inter** (`font-sans`). The spec's `#6C0FD6` / `#14A38B` / `#F97C1C` / `#0F1626` and Plus Jakarta Sans are **not** to be introduced. Spec §3's geometry, spacing, type *scale* and shadows still apply to blog work in later plans.
- **Do not introduce new hues.** Any colour not in the token list above requires sign-off.
- **TypeScript:** `strict: true`, with `allowJs: true`. New blog code (Plans 2–4) is `.ts`/`.tsx`. Existing components stay `.js` and are not converted in this plan.
- **Styling approach:** Tailwind utility classes, matching the existing components' idiom.
- **No visible change to the site in this plan.** Any layout or copy difference is a bug, not an improvement.
- **Reuse, do not re-implement,** the header, footer and Donation call-to-action (spec §1).
- **`prefers-reduced-motion`** must be respected in blog work (spec §11). Out of scope here — the existing homepage animations are unchanged by this plan.

## File Structure

| Path | Responsibility | Action |
|---|---|---|
| `playwright.config.js` | Test runner config, dev server boot, port 3010 | Create (T1) |
| `e2e/home.spec.js` | Characterization suite — the no-regression contract | Create (T1) |
| `next.config.mjs` | Next configuration | Create (T2) |
| `postcss.config.mjs` | Explicit Tailwind + autoprefixer wiring | Create (T2) |
| `tsconfig.json` | Strict TS with `allowJs`, `@/*` → `./src/*` | Create (T2) |
| `next-env.d.ts` | Next-generated type shims | Auto-generated (T2) |
| `tailwind.config.js` | Tokens; content globs; font CSS vars | Modify (T2, T3) |
| `src/app/layout.jsx` | Root HTML shell, fonts, metadata | Create (T2, T3, T7) |
| `src/app/page.jsx` | Homepage composition (replaces `src/App.js`) | Create (T2, T4) |
| `src/app/globals.css` | Single Tailwind layer import + custom classes | Create (T3) |
| `src/app/icon.jpg` | Favicon via file convention | Create (T7) |
| `src/components/ScrollToTopButton.js` | Add missing `"use client"` | Modify (T4) |
| `src/components/book-now-modal.js` | Guard `createPortal` behind mount | Modify (T4) |
| `src/components/Header.js` | Logo via `next/image` | Modify (T5) |
| `src/components/HeroSection.js` | Carousel via `next/image` | Modify (T5) |
| `src/components/AboutSection.js` | Carousel via `next/image` | Modify (T5) |
| `src/components/NewsletterSection.js` | Deterministic particles (hydration) | Modify (T6) |
| `src/App.js`, `src/App.css`, `src/index.js`, `src/index.css`, `public/index.html` | Superseded | Delete (T8) |
| `package.json` | Scripts and dependencies | Modify (T2, T8) |

---

### Task 1: Characterization test baseline against the current CRA app

Capture what the site does *today*, so the migration has an objective pass/fail. This suite must not be edited after this task — later tasks make it pass, they do not move the goalposts.

**Files:**
- Create: `playwright.config.js`
- Create: `e2e/home.spec.js`
- Modify: `package.json` (add `test:e2e` script, `@playwright/test` devDependency)

**Interfaces:**
- Consumes: nothing.
- Produces: `npm run test:e2e` — the no-regression gate every later task runs. Tests target `http://localhost:3010`.

**Why port 3010:** port 3000 is occupied by an unrelated long-running node process on this machine, and CRA silently prompts for another port when 3000 is taken, which hangs a non-interactive test run.

**Why assertions avoid apostrophes:** the components mix curly and straight apostrophes — `HeroSection.js:161` has `Africa’s` (U+2019) while `AboutSection.js:99` has `Africa's` (U+0027). Matching on substrings without apostrophes avoids a false failure that has nothing to do with the migration.

- [ ] **Step 1: Install Playwright**

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Write the Playwright config**

Create `playwright.config.js`:

```js
// @ts-check
const { defineConfig, devices } = require("@playwright/test")

const PORT = 3010
const BASE_URL = `http://localhost:${PORT}`

module.exports = defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Overridden to `npm run dev` in Task 8 once CRA is removed.
    command: `BROWSER=none PORT=${PORT} npm start`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
```

- [ ] **Step 3: Write the characterization suite**

Create `e2e/home.spec.js`:

```js
const { test, expect } = require("@playwright/test")

// Sections that must be present, in DOM order, identified the way a user
// perceives them. Copy strings are taken verbatim from the components and
// deliberately exclude apostrophes (mixed U+2019 / U+0027 in the source).
const SECTION_HEADINGS = [
  "Emerging Leaders for",            // HeroSection h1
  "Aims & Objectives",               // ProgramsSection h2
  "Future Leaders",                  // AboutSection h2
  "Voices of Impact",                // TestimonialsCarousel h2
  "Get Involved",                    // CTASection h2
  "Stay Connected with Our Community", // NewsletterSection h2
]

test.describe("homepage characterization", () => {
  test("renders every section in order", async ({ page }) => {
    await page.goto("/")
    const body = page.locator("body")
    for (const heading of SECTION_HEADINGS) {
      await expect(body).toContainText(heading)
    }
  })

  test("renders the anchor targets the nav depends on", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("#about")).toHaveCount(1)
    await expect(page.locator("#programs")).toHaveCount(1)
    await expect(page.locator("#community")).toHaveCount(1)
    await expect(page.locator("#get-involved")).toHaveCount(1)
    await expect(page.locator("#newsletter")).toHaveCount(1)
    await expect(page.locator("footer#contact")).toHaveCount(1)
  })

  test("renders the foundation name and mission block", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("body")).toContainText(
      "MOSES OF AFRICA MENTORING FOUNDATION"
    )
    await expect(page.locator("body")).toContainText("MISSION STATEMENT:")
    await expect(page.locator("body")).toContainText("VISION STATEMENT:")
  })

  test("hero carousel renders a visible image", async ({ page }) => {
    await page.goto("/")
    const heroImg = page.locator("section img").first()
    await expect(heroImg).toBeVisible()
    // Guards against a static-import regression rendering "[object Object]".
    const src = await heroImg.getAttribute("src")
    expect(src).toBeTruthy()
    expect(src).not.toContain("[object")
  })

  test("logo image resolves to a real URL", async ({ page }) => {
    await page.goto("/")
    const logo = page.getByAltText("MOA Logo").first()
    await expect(logo).toBeVisible()
    const src = await logo.getAttribute("src")
    expect(src).toBeTruthy()
    expect(src).not.toContain("[object")
  })

  test("programs tabs switch content", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "SDG Alignment" }).click()
    await expect(page.locator("body")).toContainText("SDG 4: Quality Education")
    await page.getByRole("button", { name: "Core Values" }).click()
    await expect(page.locator("body")).toContainText("Integrity")
  })
})

test.describe("donation modal", () => {
  test("opens from the header icon and closes on Escape", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Book Now" }).click()
    await expect(
      page.getByRole("heading", { name: "Donate Here" })
    ).toBeVisible()
    await expect(page.locator("body")).toContainText("mosesofafrica@gmail.com")
    await page.keyboard.press("Escape")
    await expect(
      page.getByRole("heading", { name: "Donate Here" })
    ).toBeHidden()
  })
})

test.describe("console hygiene", () => {
  test("no console errors or page exceptions on load", async ({ page }) => {
    const problems = []
    page.on("console", (msg) => {
      if (msg.type() === "error") problems.push(`console.error: ${msg.text()}`)
    })
    page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`))

    await page.goto("/", { waitUntil: "networkidle" })
    // Scroll the full page so every useInView / scroll listener fires.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1500)

    expect(problems).toEqual([])
  })
})
```

- [ ] **Step 4: Add the test script**

In `package.json`, add to `"scripts"`:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 5: Run the suite against CRA to establish the baseline**

```bash
npm run test:e2e
```

Expected: all tests PASS on both `desktop` and `mobile` projects.

If any test fails here, the test is wrong about current behaviour — fix the **test** to match what the CRA app actually does, and note the discrepancy. Do not fix the app in this task.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.js e2e/home.spec.js package.json package-lock.json
git commit -m "test: add Playwright characterization suite for the CRA homepage"
```

---

### Task 2: Next.js scaffold with explicit Tailwind and strict TypeScript

Get a Next.js App Router shell building and serving a Tailwind-styled placeholder, alongside the still-working CRA app. CRA is not removed until Task 8, so this task is reversible.

**Files:**
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `tsconfig.json`
- Create: `src/app/layout.jsx`
- Create: `src/app/page.jsx`
- Modify: `tailwind.config.js` (content globs)
- Modify: `package.json` (add `next`, `typescript`, `@types/*`; add `dev` script)

**Interfaces:**
- Consumes: nothing from Task 1 except the test script, which is not run against Next until Task 4.
- Produces: `npm run dev` serves Next on port 3010. Import alias `@/*` resolves to `./src/*`. Tailwind utilities and the eight brand colour tokens are available in `src/app/**` and `src/components/**`.

**Why `postcss.config.mjs` is mandatory here:** CRA enabled Tailwind implicitly by detecting `tailwind.config.js` (`useTailwind` in `react-scripts/config/webpack.config.js`). Next has no such detection. Without this file every utility class silently stops working, with no build error.

**Why `src/app` and not `app`:** the twelve components already live in `src/components`. Keeping the router under `src/` means no files move and the `@/*` alias points at one root.

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
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "e2e", "playwright.config.js"]
}
```

- [ ] **Step 5: Update the Tailwind content globs**

In `tailwind.config.js`, replace the `content` array. The old `./public/index.html` entry is dropped because that file is deleted in Task 8.

```js
content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
```

Leave `theme.extend.colors` and `theme.extend.fontFamily` exactly as they are for now — fonts are rewired in Task 3.

- [ ] **Step 6: Create a minimal root layout**

Create `src/app/layout.jsx`. Fonts and real metadata arrive in Tasks 3 and 7.

```jsx
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

Create `src/app/page.jsx`. The `bg-royal-purple` class is the assertion: it only renders purple if the token config and the PostCSS wiring are both correct.

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

- [ ] **Step 8: Add the dev script**

In `package.json` `"scripts"`, add `dev` alongside the existing CRA scripts (do not remove `start` yet):

```json
"dev": "next dev -p 3010"
```

- [ ] **Step 9: Run the dev server and verify**

```bash
npm run dev
```

Then in a second shell:

```bash
curl -s http://localhost:3010/ | grep -c "Next.js scaffold live"
```

Expected: `1`.

Verify Tailwind compiled by confirming the token colour reached the CSS:

```bash
curl -s http://localhost:3010/ | grep -o '/_next/static/css/[^"]*\.css' | head -1
```

Take that path and fetch it:

```bash
curl -s "http://localhost:3010/<css-path-from-above>" | grep -c "6d28d9"
```

Expected: at least `1`. A `0` means Tailwind is not running — re-check `postcss.config.mjs`.

- [ ] **Step 10: Verify the production build compiles**

```bash
npm exec next build
```

Expected: build completes, output lists `/` as a static route.

- [ ] **Step 11: Commit**

```bash
git add next.config.mjs postcss.config.mjs tsconfig.json next-env.d.ts \
  src/app/layout.jsx src/app/page.jsx tailwind.config.js package.json package-lock.json
git commit -m "build: scaffold Next.js App Router with explicit Tailwind and strict TS"
```

---

### Task 3: Global CSS consolidation and next/font wiring

Fold the two duplicated Tailwind layer imports into one, and replace the render-blocking Google Fonts `@import` with `next/font`, which self-hosts the files and eliminates the extra round trip.

**Files:**
- Create: `src/app/globals.css`
- Modify: `src/app/layout.jsx`
- Modify: `tailwind.config.js` (`fontFamily` → CSS variables)

**Interfaces:**
- Consumes: `src/app/layout.jsx` from Task 2.
- Produces: `--font-inter` and `--font-outfit` CSS variables on `<body>`. `font-sans` and `font-heading` Tailwind utilities resolve through them. All custom classes from the old `App.css` (`gradient-orange`, `gradient-teal`, `gradient-dark`, `shadow-soft`, `shadow-medium`, `shadow-large`, `shadow-glow`) remain available.

**What changes and why:**
- `src/index.css` and `src/App.css` each imported `tailwindcss/base|components|utilities`, emitting preflight and the whole utility layer twice. One copy now.
- The hand-written `.text-royal-purple` / `.bg-royal-purple` / `.border-teal` duplicates of Tailwind-generated utilities are **kept**. `CTASection.js:74` builds `text-${card.color}` at runtime, which Tailwind's scanner cannot see; these rules are its safety net. Removing them is a separate, tested change — not part of a migration.

- [ ] **Step 1: Create the consolidated global stylesheet**

Create `src/app/globals.css`. This is the union of the old `index.css` and `App.css`, with one Tailwind layer import and no font `@import`.

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
  sans: ["var(--font-inter)", "sans-serif"],
  heading: ["var(--font-outfit)", "sans-serif"],
},
```

- [ ] **Step 4: Verify the fonts and single utility layer**

```bash
npm run dev
```

In a second shell, capture the stylesheet:

```bash
CSS=$(curl -s http://localhost:3010/ | grep -o '/_next/static/css/[^"]*\.css' | head -1)
curl -s "http://localhost:3010$CSS" -o /tmp/moa.css
grep -c "font-inter" /tmp/moa.css
grep -c "box-sizing" /tmp/moa.css
```

Expected: `font-inter` count ≥ 1 (variable is referenced). `box-sizing` count is small and non-zero — preflight is present **once**, not twice. Under CRA this appeared twice.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.jsx tailwind.config.js
git commit -m "style: consolidate global CSS to one Tailwind layer and self-host fonts"
```

---

### Task 4: Port the homepage composition and fix client boundaries

Wire the twelve existing components into `src/app/page.jsx` and fix the two component-level defects that break under server rendering.

**Files:**
- Modify: `src/app/page.jsx`
- Modify: `src/components/ScrollToTopButton.js:1`
- Modify: `src/components/book-now-modal.js:1-56`

**Interfaces:**
- Consumes: `src/app/layout.jsx` and `globals.css` from Task 3; all twelve components from `src/components/`.
- Produces: the full homepage at `/`. The characterization suite from Task 1 becomes runnable against Next.

**The two defects, and why they are real:**

1. **`ScrollToTopButton.js` has no `"use client"`** but calls `useState`, `useEffect` and framer-motion. Ten of the twelve components already carry the directive as an inert leftover from a Next.js/v0 origin — under Next it becomes meaningful again, and this is the one file that needs it and lacks it. Without it, the build fails with a "You're importing a component that needs `useState`" error. `Footer.js` also lacks it and correctly stays a server component: it imports only lucide-react SVG components and uses no hooks.

2. **`book-now-modal.js` calls `createPortal(..., document.body)` in the render body.** Client components still render on the server for the initial HTML, where `document` is undefined — this throws during SSR. It must be deferred until after mount.

- [ ] **Step 1: Run the characterization suite against Next to see it fail**

Temporarily point the test server at Next by setting the env var the config honours — or simply start `npm run dev` in another shell first, since `reuseExistingServer` is true locally:

```bash
npm run dev          # shell 1
npm run test:e2e     # shell 2
```

Expected: FAIL. Every section assertion fails because `page.jsx` is still the Task 2 placeholder.

- [ ] **Step 2: Add the missing client directive**

In `src/components/ScrollToTopButton.js`, add as the very first line, followed by a blank line:

```js
"use client"
```

- [ ] **Step 3: Guard the portal behind mount**

In `src/components/book-now-modal.js`, add `mounted` state and return `null` until the component has mounted on the client.

Add after the existing `const nameRef = useRef(null)` line:

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

- [ ] **Step 4: Port the page composition**

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

- [ ] **Step 5: Run the suite and expect the image tests to still fail**

```bash
npm run test:e2e
```

Expected: the section, anchor, mission, tabs and modal tests PASS. The two image tests (`hero carousel renders a visible image`, `logo image resolves to a real URL`) FAIL — static image imports now return an object, not a string, so `src` renders as `[object Object]`. That is exactly what Task 5 fixes, and the assertion was written to catch it.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.jsx src/components/ScrollToTopButton.js src/components/book-now-modal.js
git commit -m "feat: port homepage composition to App Router and fix SSR client boundaries"
```

---

### Task 5: Fix static image imports with next/image

Under CRA, `import Logo1 from "../Images/Logo1.jpg"` yielded a URL string. Under Next it yields `{ src, width, height, blurDataURL }`. Every `<img src={...}>` fed by an import is therefore broken, and this is also the opportunity to put the 7.8 MB of unoptimized JPEGs behind Next's optimizer.

**Files:**
- Modify: `src/components/Header.js:99`
- Modify: `src/components/book-now-modal.js:96`
- Modify: `src/components/HeroSection.js:80-87`
- Modify: `src/components/AboutSection.js:204-208`

**Interfaces:**
- Consumes: the ported page from Task 4.
- Produces: all four image call sites render real, optimized URLs. Both image tests in the characterization suite pass.

**Approach:** the two carousels animate a wrapping `motion.div` that is already absolutely positioned, so `<Image fill>` slots in cleanly and the animation is untouched. The two logo usages get explicit `width`/`height`, which also satisfies spec §2's layout-shift rule.

- [ ] **Step 1: Confirm the failure mode before fixing it**

```bash
npm run dev                                              # shell 1
curl -s http://localhost:3010/ | grep -c "object Object" # shell 2
```

Expected: a count ≥ 1, proving the imports now serialize as objects.

- [ ] **Step 2: Fix the header logo**

In `src/components/Header.js`, add the import at the top of the import block:

```js
import Image from "next/image"
```

Replace the `motion.img` on line 99:

```jsx
              <Image
                src={Logo1}
                alt="MOA Logo"
                width={160}
                height={80}
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
                <Image src={Logo1} alt="MOA Logo" width={160} height={160} className="h-14 sm:h-32 md:h-40 w-auto" style={{ objectFit: 'contain' }} />
```

- [ ] **Step 4: Fix the hero carousel**

In `src/components/HeroSection.js`, add:

```js
import Image from "next/image"
```

Replace the `motion.img` block (lines 80–87) with an `Image` using `fill`. The zoom animation moves to the wrapping element via a CSS transform so framer-motion is not driving an `Image` directly:

```jsx
            <Image
              src={heroImages[currentImage].src}
              alt={heroImages[currentImage].alt}
              fill
              priority={currentImage === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
```

Note: `priority` on the first slide only — it is the LCP element (spec §12). Remaining slides lazy-load.

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

The `|| "/placeholder.svg"` fallbacks are removed in both carousels — `public/placeholder.svg` does not exist, so the fallback could only ever produce a 404. Static imports cannot be undefined, so the fallback was unreachable anyway.

- [ ] **Step 6: Run the suite**

```bash
npm run test:e2e
```

Expected: **all tests PASS**, on both desktop and mobile projects, except possibly the console-hygiene test — see Task 6.

- [ ] **Step 7: Commit**

```bash
git add src/components/Header.js src/components/book-now-modal.js \
  src/components/HeroSection.js src/components/AboutSection.js
git commit -m "fix: render images through next/image so static imports resolve"
```

---

### Task 6: Fix the hydration mismatch in NewsletterSection

`NewsletterSection.js:34-51` calls `Math.random()` for twenty floating particles during render. The server picks one set of values and the client picks another, so React reports a hydration mismatch. Under CRA there was no server render, so this was invisible.

**Files:**
- Modify: `src/components/NewsletterSection.js:1-11,33-54`

**Interfaces:**
- Consumes: nothing new.
- Produces: `console hygiene` test passes. Particle animation is visually equivalent.

**Approach:** generate the particle values once, on the client, after mount. Rendering nothing on the server is correct here — the particles are purely decorative (`bg-white/10` dots) and already hidden below `sm:`.

- [ ] **Step 1: Confirm the mismatch**

```bash
npm run dev          # shell 1
npm run test:e2e -- --grep "console hygiene"   # shell 2
```

Expected: FAIL, reporting a hydration error in the console output.

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

Replace the particle block (the `{[...Array(20)].map(...)}` expression, lines 34–53) with:

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

- [ ] **Step 4: Run the full suite**

```bash
npm run test:e2e
```

Expected: **all tests PASS** on both projects, including `console hygiene`.

- [ ] **Step 5: Commit**

```bash
git add src/components/NewsletterSection.js
git commit -m "fix: generate newsletter particles after mount to avoid hydration mismatch"
```

---

### Task 7: Metadata API, favicon and social cards

Replace the runtime favicon hack with Next's file convention, and give the site the description, canonical and social-card tags it has never had. This closes several gaps recorded in `CLAUDE.md`: five 404ing icon references, a misused meta tag where `name` held the foundation name and `content` held the tagline, and no Open Graph or Twitter tags at all.

**Files:**
- Create: `src/app/icon.jpg` (copied from `src/Images/Logo1.jpg`)
- Create: `src/app/opengraph-image.jpg` (copied from `src/Images/MOA.jpg`)
- Modify: `src/app/layout.jsx`
- Modify: `public/manifest.json`
- Modify: `e2e/home.spec.js` (append a new describe block — this is additive, not a change to existing assertions)

**Interfaces:**
- Consumes: `src/app/layout.jsx` from Task 3.
- Produces: `<title>`, `<meta name="description">`, canonical, OG and Twitter tags on every route. Later plans extend this per-post via route-level `generateMetadata`.

- [ ] **Step 1: Write the failing test**

Append to `e2e/home.spec.js`:

```js
test.describe("document metadata", () => {
  test("has title, description, canonical and social cards", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveTitle(/Moses of Africa Mentoring Foundation/)

    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveCount(1)
    expect(await description.getAttribute("content")).toContain("mentorship")

    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1)
  })

  test("serves a favicon", async ({ page, request }) => {
    await page.goto("/")
    const icon = page.locator('link[rel="icon"]').first()
    await expect(icon).toHaveCount(1)
    const href = await icon.getAttribute("href")
    const res = await request.get(href)
    expect(res.status()).toBe(200)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npm run test:e2e -- --grep "document metadata"
```

Expected: FAIL — no description, canonical, OG or Twitter tags exist.

- [ ] **Step 3: Copy the icon and social image into the app directory**

```bash
cp src/Images/Logo1.jpg src/app/icon.jpg
cp src/Images/MOA.jpg src/app/opengraph-image.jpg
```

Next serves these automatically at build time and emits the corresponding `<link>` / `<meta>` tags. No manual tags needed.

- [ ] **Step 4: Write the full metadata block**

In `src/app/layout.jsx`, replace the `metadata` export:

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

**`metadataBase` must be confirmed with the foundation before this ships** — it is the production domain and it drives every canonical and OG URL. If the Vercel domain is different, use that. This is the one value in this plan that is a placeholder pending an answer; it is called out again in the open questions below.

- [ ] **Step 5: Replace the boilerplate manifest**

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

- [ ] **Step 6: Run the tests**

```bash
npm run test:e2e
```

Expected: **all tests PASS**, including both new metadata tests.

- [ ] **Step 7: Commit**

```bash
git add src/app/layout.jsx src/app/icon.jpg src/app/opengraph-image.jpg \
  public/manifest.json e2e/home.spec.js
git commit -m "feat: add real document metadata, favicon and social cards"
```

---

### Task 8: Decommission Create React App

Remove the CRA entrypoints and dependency now that Next serves the same page and the full suite is green. This is the point of no return; everything before it was additive.

**Files:**
- Delete: `src/App.js`, `src/App.css`, `src/index.js`, `src/index.css`, `public/index.html`
- Modify: `package.json` (scripts, remove `react-scripts` and CRA-only test deps)
- Modify: `playwright.config.js` (webServer command)
- Delete: `src/.DS_Store` (untracked noise picked up while working in this directory)

**Interfaces:**
- Consumes: a fully green suite from Task 7.
- Produces: `npm run dev` (Next dev on 3010), `npm run build`, `npm start` (Next production server), `npm run lint`. **Note the semantic change: under CRA `npm start` meant "dev server"; under Next it means "production server".**

- [ ] **Step 1: Point the test server at Next**

In `playwright.config.js`, replace the `webServer.command`:

```js
    command: `npm run dev`,
```

The `-p 3010` flag already lives in the `dev` script, so the port stays aligned with `BASE_URL`.

- [ ] **Step 2: Delete the CRA entrypoints**

```bash
git rm src/App.js src/App.css src/index.js src/index.css public/index.html
rm -f src/.DS_Store
```

`robots.txt` stays in `public/`. `manifest.json` stays — Next serves it from `public/` and Task 7 gave it real values.

- [ ] **Step 3: Remove react-scripts and the unused CRA test dependencies**

The `@testing-library/*` packages were never used — there are no test files and no `src/setupTests.js`. Playwright is the test stack now.

```bash
npm uninstall react-scripts @testing-library/dom @testing-library/jest-dom \
  @testing-library/react @testing-library/user-event web-vitals
```

- [ ] **Step 4: Replace the scripts block**

In `package.json`, replace `"scripts"` in full:

```json
  "scripts": {
    "dev": "next dev -p 3010",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test:e2e": "playwright test"
  },
```

Also delete the now-meaningless `"eslintConfig"` and `"browserslist"` blocks — both were CRA-specific. Next handles its own ESLint config and browser targets.

- [ ] **Step 5: Install the Next ESLint config**

```bash
npm install --save-dev eslint eslint-config-next
```

Create `.eslintrc.json`:

```json
{
  "extends": "next/core-web-vitals"
}
```

**Version check before you rely on `next lint`.** The `next lint` command is deprecated in Next 15 and removed in later majors, and this plan installs whatever `npm install next` resolves. Run `npm exec next lint --help` once. If it reports the command as unavailable or deprecated, use the flat-config route instead — replace `.eslintrc.json` with `eslint.config.mjs`:

```js
import next from "eslint-config-next"

export default [...next()]
```

and set the script to `"lint": "eslint ."`. Record which form you used in `CLAUDE.md` in Task 9. Either way the `@next/next/no-img-element` rule must be active, because Step 6 relies on it to catch a missed `<img>`.

- [ ] **Step 6: Verify lint, build, and the full suite**

```bash
npm run lint
npm run build
npm run test:e2e
```

Expected: lint reports no errors; build succeeds and lists `/` as a route; **all tests PASS**.

If `npm run lint` flags `@next/next/no-img-element` anywhere, that is a genuine leftover `<img>` — Task 5 should have converted all four. Fix it rather than disabling the rule.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "build: remove Create React App, Next.js is now the only build"
```

---

### Task 9: Verify the production build and Vercel deployment

Confirm the migrated site behaves in a production build and on Vercel, and that deep links will work once the blog adds routes.

**Files:**
- Create: `.env.example` (documents the vars Plans 2–4 will need)
- Modify: `CLAUDE.md` (the stack section is now wrong)

**Interfaces:**
- Consumes: the completed migration.
- Produces: a verified production deploy. No `vercel.json` is needed — Vercel detects Next.js natively and handles SPA-style deep links through the framework, which is why this migration also removes a whole class of routing config the CRA setup would have required.

- [ ] **Step 1: Run the suite against a production build**

```bash
npm run build
npm start -- -p 3010    # shell 1
npm run test:e2e        # shell 2
```

Expected: **all tests PASS** against the production server. This catches anything that only works in dev — most often a client/server boundary that dev tolerates.

- [ ] **Step 2: Document the environment variables Plans 2–4 need**

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

- [ ] **Step 3: Update CLAUDE.md**

The Commands, Stack and "Styling mechanics" sections describe CRA and are now actively misleading. Apply these edits:

- **Commands:** replace the CRA block with `npm run dev` (port 3010), `npm run build`, `npm start`, `npm run lint`, `npm run test:e2e`. Note that `npm start` now means production server.
- **Stack:** "Next.js App Router · React 19 · Tailwind CSS 3.4 · framer-motion 12 · lucide-react · TypeScript (strict, allowJs) · Playwright".
- **Styling mechanics:** delete the paragraph about Tailwind being enabled by `tailwind.config.js` detection — that was a CRA behaviour. Replace with: Tailwind is wired explicitly through `postcss.config.mjs`; the duplicated layer imports are gone; fonts come from `next/font` and resolve through the `--font-inter` / `--font-outfit` CSS variables.
- **Assets:** replace the "public/ is still CRA boilerplate" section — the icons and manifest are fixed, and images now go through `next/image`.
- **Conventions:** `"use client"` is no longer inert. It is load-bearing on all eleven client components; only `Footer.js` is a server component.
- Remove the resolved items from "Content status": the missing icons, the boilerplate manifest, and the absent description/OG tags.

Leave the content-status items that are still true: placeholder testimonials, disagreeing contact details, the three name variants, dead `href="#"` links, stub forms.

- [ ] **Step 4: Push the branch and open a pull request**

```bash
git add .env.example CLAUDE.md
git commit -m "docs: update CLAUDE.md and env template for the Next.js stack"
git push -u origin <branch-name>
gh pr create --title "Migrate to Next.js App Router" --body "Platform migration ahead of the blog build. No visible change to the site; Playwright characterization suite green on desktop and mobile, dev and production."
```

- [ ] **Step 5: Verify the Vercel preview deployment**

Wait for the preview URL, then check by hand:

1. The homepage renders identically to production.
2. View source: the section headings appear in the **initial HTML**, not just after JS runs. This is the whole point of the migration — confirm it.
3. `curl -sI <preview-url>/favicon.ico` or inspect the `<link rel="icon">` href returns 200.
4. Paste the preview URL into a link-preview checker; the OG card renders with a title, description and image.

- [ ] **Step 6: Confirm the production domain and fix metadataBase**

`metadataBase` in `src/app/layout.jsx` was set to `https://mosesofafricafoundation.org` as a placeholder. Confirm the real domain with the foundation and correct it if different, then commit. Every canonical and OG URL depends on it.

---

## Self-Review

**Spec coverage for this plan's scope.** This plan implements the platform prerequisites only. Against the spec: §2's React conventions (19.2.8, function components, ref-as-prop) are satisfied by the existing code and locked in Global Constraints. §2's server-rendering requirement is what the whole plan delivers. §2's TypeScript requirement is set up in Task 2 (strict, `allowJs`) and applies to blog code in later plans. §2's image rules (`srcset`, `loading="lazy"`, explicit dimensions) are partially delivered in Task 5 via `next/image` for the existing homepage; AVIF and the 480/960/1440 widths for *blog* media are Plan 4's media pipeline. §12's per-post metadata, canonical, OG and JSON-LD are scaffolded in Task 7 and extended per-route in Plan 2. Everything else in the spec — §§1, 4–11, 13 — belongs to Plans 2–4 and is deliberately absent here.

**Gaps I am aware of and have placed rather than dropped:**
- Spec §11 `prefers-reduced-motion`: not addressed for the existing homepage, which is animation-heavy. This plan promises no visible change, and adding motion suppression *is* a visible change. Logged as a follow-up, not silently skipped.
- Spec §2 "TanStack Query where server rendering is unavailable": no longer needed for reads once SSR exists. Revisit only if a client-fetched surface appears.
- Acceptance criterion 10 (Lighthouse ≥90 / accessibility 100) is measured on blog routes, so it is verified in Plan 2. Task 5's `next/image` conversion is the groundwork.

**Placeholder scan:** one intentional placeholder remains — `metadataBase`'s domain, flagged inline in Task 7 Step 4 and given its own verification step in Task 9 Step 6. No `TBD`, no "add error handling", no "similar to Task N"; every code step carries its actual code.

**Type consistency:** component and prop names used here match the source exactly — `BookNowModal` takes `isOpen`/`onClose`; `ScrollToTopButton` takes `threshold`/`minContentRatio`. The `@/*` alias is defined once in Task 2 and used consistently from Task 4. The `particles` array shape declared in Task 6 Step 2 (`dx`, `dy`, `duration`, `delay`, `left`, `top`) is the same shape consumed in Step 3.

---

## Open questions blocking later plans

Carried from spec §14, plus two the codebase raises. None block Plan 1.

1. **Production domain** — needed to finalise `metadataBase` (Task 9, Step 6).
2. **Which Supabase project / region**, and confirmation that Supabase + Cloudinary is approved rather than Payload.
3. **Is Publish ever scheduled**, or always immediate? Changes the `Post.status` union in spec §6.
4. **Do staff need email notification** when a comment arrives?
5. **Are categories fixed** (Mentorship, Education, Outreach, Partnerships) or staff-editable? Fixed means a union type; editable means a table.
6. **Second language at launch?** If yes, routing changes shape before Plan 2 starts, so this is the most expensive question to answer late.
7. **Staff identity** — how do the two or three staff accounts get created? Supabase invite, or self-signup with an allowlist?

---

## Roadmap — Plans 2 to 4

Written after Plan 1 lands, so each can assume a known platform.

**Plan 2 — Public read surfaces (spec 1a, 1b, 1d).** Routes `/blog`, `/blog/page/:n`, `/blog/category/:slug`, `/blog/:slug`, plus `LatestPostsBlock` on `/`. Supabase schema for posts, categories and media; server components reading directly. Components from spec §4: `BlogIndex`, `FeaturedPost`, `RecentList`, `PostCard`, `CategoryChips`, `MediaBadge`, `PlayBadge`, `PostHeader`, `PostBody`, `GalleryGrid`, `Lightbox`, `VideoPlayer`, `PullQuote`, `LatestPostsBlock`. Delivers acceptance criteria 1–5, 9, 10. Also un-comments the `BLOG` nav item in `Header.js:24` and adds it to `Footer.js` quick links.

**Plan 3 — Comments (spec §8).** `CommentThread`, `CommentForm`, `Comment`. Supabase table with RLS enforcing that staff-only Delete is absent from the public payload, not merely hidden — the mechanism criterion 7 requires. `useActionState` for submit, `useOptimistic` for instant append, honeypot, 60-second per-IP throttle, 2000-character cap, link stripping, cursor pagination at three per page, one nesting level, and the "Comment removed" tombstone from the §8 warning. Delivers criteria 6 and 7.

**Plan 4 — Editor, auth and media (spec 1c, §9).** Supabase Auth with a staff role; `/admin/blog/new` and `/admin/blog/:id/edit` gated in middleware. `PostEditor`, `MediaDropzone`, `RichTextEditor`, `CardPreview`. Cloudinary upload with per-file progress, 200 MB cap, MP4 transcode with poster extraction and the "processing" state, required alt text before publish, 30-second autosave. Delivers criterion 8.
