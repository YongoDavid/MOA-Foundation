# Manual QA Checklist — Direction A redesign

`scripts/smoke.sh` (112 assertions) and `next build` cover server-rendered
output and build integrity. They cannot cover hydration warnings, interaction,
or anything that only exists once JavaScript runs. **Run this in a real
browser before merging**, at 1440px and at 390px.

> **This list is not a regression guard.** It records one person's observation
> on one day. Nothing here re-runs in CI, so a later change can break any of it
> silently. That is the standing cost of having no test framework, which is a
> deliberate project decision — not an oversight to fix by adding one.

## Run log

**Automated pass, 27 August 2026** against `http://localhost:3010`, by Claude
over HTTP. Marked `[x]` below are the items verifiable from served markup,
compiled CSS, HTTP status and static analysis. **Items marked `[ ]` need a
human with a browser** — no browser engine was involved, so nothing about
console output, actual pixels, animation, focus appearance or pointer/keyboard
interaction was observed. Do not read a `[x]` as "someone looked at it".

Scope of the automated pass: 20 routes fetched; all 57 distinct hrefs
crawled; 18 distinct optimised images fetched and byte-checked; the compiled
stylesheet audited for palette, radii, shadows and font families; all four
forms checked for field presence, labelling and submit wiring; gallery and
blog filtering exercised without JavaScript; heading order and landmarks
checked on every route.

**Four defects were found and fixed during the pass** — see the notes inline.

The two previous rounds (Next.js migration, 24 Aug 2026; blog prototype) were
signed off by the project owner and their items are folded in below where they
still apply.

---

## 1. Console — the highest-value check

Hydration mismatches are this codebase's recurring bug: three separate
instances so far (random particles, locale dates, the preloader). They are
browser-console warnings that `next build` does not surface and `curl` cannot
see. **This section is the only evidence that exists for any of those fixes.**

- [ ] DevTools open, hard-reload each of the eleven routes. **Zero errors.**
      *(Not automatable. Static audit found no non-deterministic value in any
      render body, and repeated fetches of the same route are byte-identical
      apart from Next's per-request router token — so no known hydration
      trigger remains. That is evidence, not proof.)*
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
- [x] With JavaScript disabled the overlay is **absent** and the site is usable.
      *(`noscript` rule present; all content server-rendered.)*

## 3. Navigation and shell

- [x] Every header nav item reaches its route. *(All 20 routes 200; all 57
      hrefs crawled, zero broken. Underline appearance still needs eyes.)*
- [ ] `/programs/apply` and `/programs/mentor` both mark **PROGRAMS** current.
- [x] Footer links all resolve — none 404, none are `#` except the socials.
- [ ] Skip link: press Tab from a fresh load. "Skip to main content" appears
      first and jumps to the content.
- [ ] Focus is visible on every interactive element, on both light and dark
      grounds.

## 4. Forms — all four

For **each** of `/programs/apply`, `/programs/mentor`, `/donate`, `/contact`:

- [ ] Submit empty. Inline errors appear on every required field; the page does
      not navigate. *(Fields, labels, `noValidate` and submit wiring verified
      server-side; the error rendering itself needs a browser.)*
- [ ] Errors are announced to a screen reader and tied to their input.
- [ ] Fill correctly and submit. **The form is replaced** by the panel that
      says nothing was sent, and gives the email and phone.
- [ ] That panel's email and phone are tappable links.
- [ ] Segmented controls: selecting one deselects the others; keyboard arrows
      move between them.
- [x] `/donate` shows "No payment is taken on this website" and asks for **no
      card details at all**. *(Statement present; zero card/CVV/expiry/amount
      fields. Also enforced by smoke.)*

## 5. Gallery

- [x] All six filters work. *(Counts verified: 19 total / 11 courtesy visits /
      1 summit / 2 governance / 1 advocacy / 4 engagements.)*
- [x] "Load more photographs" reveals the rest; the counter updates.
      *(`?show=24` renders all 19; counter reads "19 of 19".)*
- [x] Switching filter **resets** to the first page.
- [x] With JavaScript disabled, filters still work — they are plain links.
- [x] `/gallery?category=Summits` deep-links correctly.
- [ ] No horizontal page scroll at 390px.
- [ ] The feature tile spans two columns and two rows; no gaps in the grid.

## 6. Blog

- [ ] **Lightbox.** Click a gallery photo. It opens, arrow keys move between
      **all** photos in the set (not just the three visible tiles), Escape
      closes, focus returns to the tile that opened it.
- [ ] **Comments.** Post one. It appears instantly at the top. **Refresh — it
      is gone.** Expected: fixtures, no backend.
- [ ] Empty name on a comment gives an inline error.
- [x] Delete never appears in the public DOM. Badge is green in markup.
- [x] Category tabs navigate to real URLs; all four resolve.
- [ ] Post body, quote and tags all render in the site palette.

## 7. Mobile (390px) — every route

- [ ] Hamburger opens the full-screen ink menu; Escape and the gold cross close it.
- [ ] Body scroll is locked while the menu is open.
- [ ] **Every tap target is at least 44–48px.** Check specifically: hamburger,
      menu close, footer link columns, footer socials, menu phone/email, SDG
      grid "full report" link, blog comment composer.
- [x] The four-column footer is `grid-cols-2` below `lg`.
- [ ] No horizontal scroll on any route. Check the SDG grid and the gallery.
- [ ] Filter bars scroll horizontally with **no visible scrollbar**.

## 8. Typography and shape

- [x] Big Shoulders and Manrope are the only families in the compiled CSS —
      no Inter, no Outfit, no Jakarta. *(Rendering still needs eyes.)*
- [ ] Body copy is **Manrope**.
- [ ] Hard-reload with a cold cache: watch the first paint. The fallback should
      not reflow jarringly into the webfont.
- [x] **No rounded corners anywhere.** *(Compiled CSS carries exactly one
      radius: `50%`, the preloader rings.)*
- [x] **No drop shadows.** *(**Defect found and fixed:** the 66px play badge
      still had one, and Tailwind was emitting a `.shadow` rule because its
      scanner reads the word out of a code comment. Now asserted by smoke.)*

## 9. Images

> **Defect found and fixed during the pass:** the four blog category pages
> jumped from `<h1>` straight to `<h3>`, because the post cards under the page
> title were fixed at h3. Heading level is now a prop on `PostCard`, set to 2
> on those pages. Smoke asserts no route skips a level.

- [ ] Header logo sits snug against the wordmark — **no empty gap to its right**.
      (This shipped as a real bug once.)
- [ ] No image is squashed, stretched or letterboxed.
- [x] All 18 distinct images return 200 with real bytes through the optimiser.
- [ ] Favicon appears in the tab.
- [x] The tab title reads **"Moses Mentoring Foundation"** on `/`, and
      "<Page> · Moses Mentoring Foundation" elsewhere.

## 10. Cross-cutting: the redesign actually landed

- [x] **No purple or teal anywhere on any route**, including the blog.
      *(**Defect found and fixed:** `manifest.json` still had `theme_color:
      #6d28d9`, which paints the Android browser chrome.)*
- [ ] The blog looks like the same website as the homepage — same palette, same
      typefaces, same square corners, same header and footer.

---

## Known limitations — expected, not bugs

1. **No form submits.** All four validate and then say so. No backend by
   client decision.
2. **Comments do not persist.** A refresh clears them.
3. **Blog body copy for posts 2–7 is placeholder.** Post 1 is approved copy.
4. **No year filter on `/gallery`** — no photograph has a capture date.
6. **All social links are `href="#"`.**
