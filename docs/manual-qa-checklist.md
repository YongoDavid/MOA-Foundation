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
