# Manual QA Checklist — Next.js migration

`scripts/smoke.sh` and `next build` cover server-rendered output and build
integrity. They cannot cover hydration warnings or interaction. Run this
list in a real browser before merging, at desktop width and at 390px.

## Console (the highest-value check — and the ONLY evidence for the Task 5 fix)
- [ ] Open DevTools console, hard-reload `/`. **Zero errors.**
- [ ] Specifically: no "Hydration failed", no "server rendered HTML didn't match".
- [ ] Scroll to the bottom of the page. Still zero errors.
- [ ] At desktop width, watch the dark newsletter panel near the page bottom:
      ~20 faint white dots should drift and fade continuously. They appear a
      moment after load, not instantly. **Zero dots, or a console hydration
      warning, means the Task 5 fix regressed.**

**This section was never verified by automation.** A hydration mismatch is a
browser-console warning: `next build` does not surface it, `curl` cannot see
it, and this project has no test framework by design. The `NewsletterSection`
particle fix (commit `b6ebb4b`) is correct by construction — `useState([])`
makes the array empty on both the server render and the first client render,
so there is nothing to mismatch, and the dots arrive on a later render React
never compares — but *correct by construction is not the same as observed*.
A human must read this console once before merge.

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

## Logo sizing (a real bug once shipped here)
- [ ] Header logo sits snug against the wordmark — **no empty gap to its right**.
- [ ] Logo is not squashed or stretched; it is a portrait image (1024×1536).
- [ ] Logo shrinks smoothly when the header condenses on scroll.
- [ ] Logo in the donation drawer is the same shape as the header's, just larger.

Why this is called out: hardcoded `width`/`height` props on `next/image` override
the true dimensions of a static import. They were once set to 2:1 in the header
and 1:1 in the drawer for a file that is actually 2:3, which letterboxed the logo
inside an oversized box. The props are now omitted so Next infers the real size —
if anyone re-adds them, this is what breaks.

## Gaps nothing automated can cover
These three were identified in the final branch review as changes with neither
an automated assertion nor, previously, a checklist item.

- [ ] **CTA card icon colours.** The three "Get Involved" cards must show a
      purple, a teal and an orange icon. `CTASection.js` composes those class
      names at runtime (`text-${card.color}`), which Tailwind's scanner cannot
      see — they only work because `globals.css` hand-writes them. Delete those
      rules and smoke still passes green while the icons lose their colour.
- [ ] **First-paint font.** Hard-reload with a cold cache and watch the very
      first frame: text should appear in the system UI font, then swap to Inter
      — not in generic Helvetica/Arial. This is the only check on the fallback
      chain that commit ff3aa96 exists to protect.
- [ ] **Carousel images on first pass.** Step through the hero and about
      carousels once each. Only the first hero slide is `priority`; the rest
      lazy-load, so a slide can show a blank frame the old `<img>` never did.
      "Advances every 5s" would tick true even with every frame blank.

## Visual parity
- [ ] Compare against the pre-migration site side by side. Fonts, colours,
      spacing and image framing are unchanged.
- [ ] Favicon shows the MOA logo in the browser tab.
