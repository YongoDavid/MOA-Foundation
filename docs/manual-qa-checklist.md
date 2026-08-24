# Manual QA Checklist — Next.js migration

`scripts/smoke.sh` and `next build` cover server-rendered output and build
integrity. They cannot cover hydration warnings or interaction. Run this
list in a real browser before merging, at desktop width and at 390px.

> **Signed off 24 August 2026** by the project owner, in their own browser
> against a local server on `:3010`. The hydration console check and the
> particle animation were verified explicitly on request; the remainder was
> confirmed as "good to go from my end".
>
> Two caveats worth keeping honest, for whoever reads this next:
> 1. The three items under **Gaps nothing automated can cover** are subtle —
>    they need a deliberate look rather than general use. If anything later
>    seems off with CTA icon colours, first-paint font, or a blank carousel
>    frame, re-check those three first; they were not individually narrated
>    back.
> 2. Ticking this list is not a regression guard. It records one observation
>    on one day. Nothing here re-runs in CI, so a future change can break any
>    of it silently — that is the standing cost of having no test framework.

## Console (the highest-value check — and the ONLY evidence for the Task 5 fix)
- [x] Open DevTools console, hard-reload `/`. **Zero errors.**
- [x] Specifically: no "Hydration failed", no "server rendered HTML didn't match".
- [x] Scroll to the bottom of the page. Still zero errors.
- [x] At desktop width, watch the dark newsletter panel near the page bottom:
      ~20 faint white dots should drift and fade continuously. They appear a
      moment after load, not instantly. **Zero dots, or a console hydration
      warning, means the Task 5 fix regressed.**

**Verified 24 August 2026: console clean, dots present.** This section cannot
be automated — a hydration mismatch is a browser-console warning that
`next build` does not surface and `curl` cannot see, and this project has no
test framework by design.

The `NewsletterSection` fix (commit `b6ebb4b`) was already correct by
construction: `useState([])` makes the array empty on both the server render
and the first client render, so there is nothing to mismatch, and the dots
arrive on a later render React never compares. The server-side signature was
confirmed independently — the particle container is served as
`<div class="absolute inset-0 overflow-hidden hidden sm:block"></div>`, empty,
with zero particle nodes. The console read closes the loop: correct by
construction *and* observed.

Re-check this section after any change to `NewsletterSection`, to the
`createPortal` mount guard in `book-now-modal.js`, or to anything that moves
work between server and client render.

## Donation modal
- [x] Header grid icon opens the drawer; heading reads "Donate Here".
- [x] Desktop nav "DONATION" opens the same drawer (it is not an anchor).
- [x] Mobile menu "Donate Now" opens it and closes the menu.
- [x] Escape closes it. Clicking the backdrop closes it.
- [x] While open, the page behind does not scroll.
- [x] The name field is focused shortly after opening.

## Programs tabs
- [x] "Specific Objectives" shows a two-column bullet list.
- [x] "SDG Alignment" shows six SDG cards.
- [x] "Core Values" shows five cards.
- [x] The violet pill animates between tabs.

## Carousels
- [x] Hero advances on its own roughly every 5s.
- [x] Hero arrows (desktop) and dots both work.
- [x] About-section carousel advances and its arrows work.
- [x] Testimonials advance on their own; drag-swipe works on touch.

## Navigation
- [x] Desktop "ABOUT US" / "PROGRAMS" / "CONTACT" scroll to the right sections,
      not hidden behind the sticky header.
- [x] Mobile menu links smooth-scroll with the header offset applied.
- [x] Scroll progress bar fills as the page scrolls.
- [x] At 390px, the scroll-to-top button appears after ~300px and returns to top.

## Logo sizing (a real bug once shipped here)
- [x] Header logo sits snug against the wordmark — **no empty gap to its right**.
- [x] Logo is not squashed or stretched; it is a portrait image (1024×1536).
- [x] Logo shrinks smoothly when the header condenses on scroll.
- [x] Logo in the donation drawer is the same shape as the header's, just larger.

Why this is called out: hardcoded `width`/`height` props on `next/image` override
the true dimensions of a static import. They were once set to 2:1 in the header
and 1:1 in the drawer for a file that is actually 2:3, which letterboxed the logo
inside an oversized box. The props are now omitted so Next infers the real size —
if anyone re-adds them, this is what breaks.

## Gaps nothing automated can cover
These three were identified in the final branch review as changes with neither
an automated assertion nor, previously, a checklist item.

- [x] **CTA card icon colours.** The three "Get Involved" cards must show a
      purple, a teal and an orange icon. `CTASection.js` composes those class
      names at runtime (`text-${card.color}`), which Tailwind's scanner cannot
      see — they only work because `globals.css` hand-writes them. Delete those
      rules and smoke still passes green while the icons lose their colour.
- [x] **First-paint font.** Hard-reload with a cold cache and watch the very
      first frame: text should appear in the system UI font, then swap to Inter
      — not in generic Helvetica/Arial. This is the only check on the fallback
      chain that commit ff3aa96 exists to protect.
- [x] **Carousel images on first pass.** Step through the hero and about
      carousels once each. Only the first hero slide is `priority`; the rest
      lazy-load, so a slide can show a blank frame the old `<img>` never did.
      "Advances every 5s" would tick true even with every frame blank.

## Visual parity
- [x] Compare against the pre-migration site side by side. Fonts, colours,
      spacing and image framing are unchanged.
- [x] Favicon shows the MOA logo in the browser tab.
