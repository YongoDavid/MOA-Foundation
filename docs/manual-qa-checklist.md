# Manual QA Checklist — Direction A redesign

`scripts/smoke.sh` (112 assertions) and `next build` cover server-rendered
output and build integrity. They cannot cover hydration warnings, interaction,
or anything that only exists once JavaScript runs. **Run this in a real
browser before merging**, at 1440px and at 390px.

> **This list is not a regression guard.** It records one person's observation
> on one day. Nothing here re-runs in CI, so a later change can break any of it
> silently. That is the standing cost of having no test framework, which is a
> deliberate project decision — not an oversight to fix by adding one.

The two previous rounds (Next.js migration, 24 Aug 2026; blog prototype) were
signed off by the project owner and their items are folded in below where they
still apply. Everything here is **unrun** against the redesign.

---

## 1. Console — the highest-value check

Hydration mismatches are this codebase's recurring bug: three separate
instances so far (random particles, locale dates, the preloader). They are
browser-console warnings that `next build` does not surface and `curl` cannot
see. **This section is the only evidence that exists for any of those fixes.**

- [ ] DevTools open, hard-reload each of the eleven routes. **Zero errors.**
- [ ] Specifically: no "Hydration failed", no "server rendered HTML didn't match".
- [ ] Scroll each page to the bottom. Still zero.

## 2. Preloader (restyled Task 11)

- [ ] On first load the overlay is **paper (#FBF8F3)**, not white-blue.
- [ ] The logo pulses in a double-thump heartbeat, not a single smooth breath.
- [ ] Outer ring: faint green track, **gold** moving arc. Inner ring counter-
      rotates with a **green** arc. No purple anywhere.
- [ ] The message pill is a **square green block with paper text** — not a
      rounded white pill.
- [ ] It dismisses after ~3s, and always within 5.2s even on a slow load.
- [ ] With `prefers-reduced-motion: reduce` it dismisses almost immediately and
      nothing animates.
- [ ] With JavaScript disabled the overlay is **absent** and the site is usable.

## 3. Navigation and shell

- [ ] Every header nav item reaches its route; the current one shows the umber
      underline.
- [ ] `/programs/apply` and `/programs/mentor` both mark **PROGRAMS** current.
- [ ] Footer links all resolve — none 404, none are `#` except the socials.
- [ ] Skip link: press Tab from a fresh load. "Skip to main content" appears
      first and jumps to the content.
- [ ] Focus is visible on every interactive element, on both light and dark
      grounds.

## 4. Forms — all four

For **each** of `/programs/apply`, `/programs/mentor`, `/donate`, `/contact`:

- [ ] Submit empty. Inline errors appear on every required field; the page does
      not navigate.
- [ ] Errors are announced to a screen reader and tied to their input.
- [ ] Fill correctly and submit. **The form is replaced** by the panel that
      says nothing was sent, and gives the email and phone.
- [ ] That panel's email and phone are tappable links.
- [ ] Segmented controls: selecting one deselects the others; keyboard arrows
      move between them.
- [ ] `/donate` shows "No payment is taken on this website" and asks for **no
      card details at all**.

## 5. Gallery

- [ ] All six filters work and the current one is underlined.
- [ ] "Load more photographs" reveals the rest; the counter updates.
- [ ] Switching filter **resets** to the first page.
- [ ] With JavaScript disabled, filters still work — they are plain links.
- [ ] `/gallery?category=Summits` deep-links correctly.
- [ ] No horizontal page scroll at 390px.
- [ ] The feature tile spans two columns and two rows; no gaps in the grid.

## 6. Blog

- [ ] **Lightbox.** Click a gallery photo. It opens, arrow keys move between
      **all** photos in the set (not just the three visible tiles), Escape
      closes, focus returns to the tile that opened it.
- [ ] **Comments.** Post one. It appears instantly at the top. **Refresh — it
      is gone.** Expected: fixtures, no backend.
- [ ] Empty name on a comment gives an inline error.
- [ ] The staff "FOUNDATION" badge is **green**, and Delete never appears.
- [ ] Category tabs navigate to real URLs; the current one is underlined.
- [ ] Post body, quote and tags all render in the site palette.

## 7. Mobile (390px) — every route

- [ ] Hamburger opens the full-screen ink menu; Escape and the gold cross close it.
- [ ] Body scroll is locked while the menu is open.
- [ ] **Every tap target is at least 44–48px.** Check specifically: hamburger,
      menu close, footer link columns, footer socials, menu phone/email, SDG
      grid "full report" link, blog comment composer.
- [ ] Two-column bands stack; the four-column footer becomes two.
- [ ] No horizontal scroll on any route. Check the SDG grid and the gallery.
- [ ] Filter bars scroll horizontally with **no visible scrollbar**.

## 8. Typography and shape

- [ ] Headings render in **Big Shoulders** — condensed, uppercase. If they look
      like ordinary sans-serif, the font failed to load.
- [ ] Body copy is **Manrope**.
- [ ] Hard-reload with a cold cache: watch the first paint. The fallback should
      not reflow jarringly into the webfont.
- [ ] **No rounded corners anywhere** — cards, buttons, inputs, images, badges.
      The only circles are the preloader rings.
- [ ] **No drop shadows.**

## 9. Images

- [ ] Header logo sits snug against the wordmark — **no empty gap to its right**.
      (This shipped as a real bug once.)
- [ ] No image is squashed, stretched or letterboxed.
- [ ] Every hero and band photograph loads; none collapse to zero height.
- [ ] Favicon appears in the tab.
- [ ] The tab title reads **"Moses Mentoring Foundation"** on `/`, and
      "<Page> · Moses Mentoring Foundation" elsewhere.

## 10. Cross-cutting: the redesign actually landed

- [ ] **No purple or teal anywhere on any route**, including the blog.
- [ ] The blog looks like the same website as the homepage — same palette, same
      typefaces, same square corners, same header and footer.

---

## Known limitations — expected, not bugs

1. **No form submits.** All four validate and then say so. No backend by
   client decision.
2. **Comments do not persist.** A refresh clears them.
3. **Blog body copy for posts 2–7 is placeholder.** Post 1 is approved copy.
4. **No year filter on `/gallery`** — no photograph has a capture date.
5. **`src/Images/mmf-logo.png` is missing**; the footer falls back to
   `Logo1.jpg`. Needs the real file placed by hand.
6. **All social links are `href="#"`.**
