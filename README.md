# Moses Mentoring Foundation

The public website for the **Moses Mentoring Foundation**, a Nigeria-based non-profit
(Abuja, F.C.T.) that mentors African youth in leadership, education, entrepreneurship and
peace advocacy.

**Live:** https://www.mosesmentoringfoundation.org

Eleven public routes plus a small admin area. The marketing pages are static content in
the repo; the blog is database-backed and authored through `/admin`.

## Running it

```bash
npm install
cp .env.example .env.local   # then fill .env.local in — see below
npm run dev                  # http://localhost:3010
```

Port 3010, not 3000 — 3000 is occupied on the maintainer's machine and the smoke script
defaults to 3010 to match.

**Fill in `.env.local`, never `.env.example`.** The example file is committed and is a
template; Next reads `.env.local`, which is git-ignored. Putting real values in the
wrong one leaves the app unconfigured *and* puts secrets in version control.

Without Supabase credentials the marketing pages work normally and the blog shows no
posts. It will not crash.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | dev server on :3010 |
| `npm run build` | production build — the real gate, and it runs `check:case` first |
| `npm start` | production server on :3010 |
| `npm run lint` | ESLint; fails on errors |
| `npm run smoke` | 130 assertions against a running server |
| `npm run check:case` | asset imports vs `git ls-files` — catches case bugs macOS cannot |
| `npm run check:rls` | proves the Supabase access policies hold |
| `npm run check:comments` | drives the real comment logic against the project |
| `npm run seed:blog` | fills an empty database from the fixture content |

`SMOKE_PROD=1 npm run smoke https://www.mosesmentoringfoundation.org` checks the live
site, including the production-only og:image assertion.

**There is no test framework, by deliberate decision.** Verification is the build, the
smoke script, and `docs/manual-qa-checklist.md` for what neither can reach. Please do
not add Jest or Playwright.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 3.4 · TypeScript ·
Supabase (Postgres, Auth, Storage) · deployed on Vercel.

## Layout

```
src/app/          routes; layout.jsx is the shell
src/components/   bands/ shell/ forms/ blog/ admin/ gallery/ data/
src/lib/          content, tokens and data access — copy lives here, not in components
supabase/         SQL migrations, run by hand in the Supabase SQL editor
scripts/          smoke and the check/seed utilities
docs/             plans and the manual QA checklist
```

## Before you change anything

Read **`CLAUDE.md`**. It is the real documentation — the design system and its rules, the
content that is approved verbatim and must not be reworded, the deployment requirements,
and a list of mistakes this project has already made once. It is worth the ten minutes.
