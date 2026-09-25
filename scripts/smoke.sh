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

# Wait for the server to be genuinely ready, rather than sleeping a guessed
# number of seconds.
#
# Against a fresh `next dev` the first request triggers route compilation, and
# the stylesheet it references can still be building — which produced
# intermittent false failures on the CSS assertions (1 run in 4 from a cold
# start). Bolting a retry onto each check patches symptoms one at a time; the
# actual precondition is "the page and its stylesheet are both compiled", so
# poll for exactly that. Against an already-warm or production server the first
# probe succeeds and this costs one extra request.
ready=0
for _ in 1 2 3 4 5 6 7 8 9 10; do
  probe=$(curl -fsS --max-time 30 "$BASE/" 2>/dev/null) || { sleep 2; continue; }
  probe_css=$(grep -o '/_next/static/\(css\|chunks\)/[^"]*\.css' <<< "$probe" | head -1)
  if [ -n "$probe_css" ] && curl -fsS --max-time 20 "$BASE$probe_css" 2>/dev/null | grep -q '.'; then
    ready=1
    break
  fi
  sleep 2
done
if [ "$ready" -ne 1 ]; then
  echo "WARN: server did not report a compiled stylesheet within ~20s — results may be unreliable"
fi

html_raw=$(curl -fsS --max-time 20 "$BASE/") || {
  echo "FATAL: could not fetch $BASE/ — is the server running?"
  exit 1
}

# Strip React's comment markers before matching anything.
#
# Interpolated JSX serialises with them between text nodes: {300}+ becomes
# "300<!-- -->+", and "{solid} solid marks" becomes "30<!-- --> solid marks".
# Every text assertion below would otherwise need to know that, so it is done
# once here. No assertion depends on the markers. This has caught me out four
# separate times.
html=$(sed 's/<!-- -->//g' <<< "$html_raw")

pass() { printf '  ok    %s\n' "$1"; }
fail() { printf '  FAIL  %s\n' "$1"; FAILURES=$((FAILURES + 1)); }

# NOTE ON `grep -q` AND `pipefail` — the reason these use here-strings.
#
# `printf '%s' "$big" | grep -q pat` is a trap under `set -o pipefail`.
# grep -q exits the instant it matches, closing the pipe; printf, still
# writing, takes SIGPIPE and exits 141; pipefail then makes the whole pipeline
# non-zero even though the match SUCCEEDED. Whether printf has finished
# writing first is a race, so the assertion passes or fails at random.
#
# This was silently corrupting results — failures blamed on "cold dev server
# flakiness" were actually this. Here-strings involve no pipeline, so there is
# no SIGPIPE and no pipefail interaction.

# Assert a literal string is present in the served HTML.
contains() {
  if grep -qF -- "$2" <<< "$html"; then pass "$1"; else fail "$1 (missing: $2)"; fi
}

# Assert a literal string is ABSENT from the served HTML.
absent() {
  if grep -qF -- "$2" <<< "$html"; then fail "$1 (found: $2)"; else pass "$1"; fi
}

# Assert the first URL in the HTML matching a pattern actually resolves to a
# resource of the expected content-type. Checking that a URL is *referenced*
# proves nothing — a broken image optimizer still emits the markup.
# $1 description, $2 grep pattern for the URL, $3 expected content-type prefix
resolves() {
  local url status ctype
  # Cut at the first space so srcset descriptors ("... 1x, ... 2x") are not
  # swallowed, and unescape &amp; back to & so the query string is valid.
  url=$(grep -o "$2" <<< "$html" | head -1 | sed 's/&amp;/\&/g')
  if [ -z "$url" ]; then fail "$1 (no URL matching $2 in page)"; return; fi
  # One retry. Against a cold `next dev`, the first request for an optimized
  # image can race route compilation and fail transiently — observed once while
  # adding the blog routes. A single retry absorbs that without masking a
  # genuinely broken optimizer, which fails both attempts. A flaky assertion
  # teaches people to re-run rather than investigate, which is nearly as
  # corrosive as one that cannot fail.
  status=$(curl -o /dev/null -s -w '%{http_code}' --max-time 20 "$BASE$url")
  if [ "$status" != "200" ]; then
    sleep 2
    status=$(curl -o /dev/null -s -w '%{http_code}' --max-time 20 "$BASE$url")
  fi
  ctype=$(curl -o /dev/null -s -w '%{content_type}' --max-time 20 "$BASE$url")
  if [ "$status" = "200" ] && case "$ctype" in "$3"*) true ;; *) false ;; esac; then
    pass "$1 ($status $ctype)"
  else
    fail "$1 (got status=$status type=$ctype; expected 200 $3*)"
  fi
}

echo "Smoke checking $BASE"

echo "-- homepage bands (spec §4, nine in document order)"
contains "hero headline"                "Emerging Leaders"
contains "hero gold accent"             "Excellence."
contains "band: mandate"                "Our mandate"
contains "mandate verbatim"             "To inspire guide and equip African youths"
contains "band 01: evidence"            "01 — The evidence"
contains "band 02: SDG alignment"       "02 — SDG alignment"
contains "band 03: who we work with"    "03 — Who we work with"
contains "band 04: our vision"          "04 — Our vision"
contains "band 05: aims & objectives"   "05 — Aims"
contains "band 06: take part"           "06 — Take part"
contains "band 07: from the field"      "07 — From the field"
contains "band: newsletter"             "Our quarterly report"

echo "-- objectives ship visible with real copy"
# The spec's stop-block says to hide band 05 pending copy; that note predates
# the v3 mockup, whose ten objectives are those already published on the
# previous site. Client confirmed 27 Aug the band ships visible.
contains "objective 01"                 "Harnessing youth potential"
contains "objective 10"                 "Encouraging creativity and forward-thinking"

echo "-- three pathways"
contains "pathway: mentee"              "Apply as a mentee"
contains "pathway: mentor"              "Mentor a cohort"
contains "pathway: donate"              "Fund a place in the next cohort"

echo "-- retired palette is gone from the homepage"
# Every homepage band is redesigned; none of the old tokens may survive here.
# The blog keeps its own palette until Task 10, and smoke only fetches /.
absent   "no royal-purple"              "royal-purple"
absent   "no bright-orange"             "bright-orange"
absent   "no dark-navy"                 "dark-navy"
absent   "no medium-gray"               "medium-gray"

echo "-- images"
# Spec §3 forbids the logo image in the header: the mark is a near-square
# 813x951 badge that shrinks to illegibility in an 88px bar. The brass rule
# and wordmark are the lockup. This asserts the ban holds.
header_html=$(sed -n 's/.*\(<header[^>]*bg-paper[^>]*>\).*/\1/p' <<< "$html" | head -1)
if grep -q '<img' <<< "$(sed 's/.*<header[^>]*bg-paper[^>]*>//; s/<\/header>.*//' <<< "$html")"; then
  fail "no logo image in the header (spec §3)"
else
  pass "no logo image in the header (spec §3)"
fi
contains "footer logo present"          'alt="Moses Mentoring Foundation'
# next/image rewrites srcs through the optimizer; a raw /static/media path
# would mean the component is still using a bare <img>.
contains "images routed via optimizer"  "/_next/image"
# ...and the optimizer must actually return an image. A missing sharp binary
# or misconfigured optimizer still emits the markup above while every image
# on the page is broken, so the reference alone is not evidence.
resolves "optimizer serves real bytes"  '/_next/image?url=[^" ]*' "image/"

echo "-- regressions"
# Static image imports return an object under Next; a bare {import} in src
# serialises as "[object Object]". Vacuously true until Task 4 renders real
# images, then becomes the live canary for that whole class of regression.
absent   "no object-serialisation leak"  "[object Object]"

echo "-- document metadata"
# Anchored to the actual <title> tag / meta content attribute, not a bare
# substring search: the identical phrase already appears in the rendered
# About-section body copy, so an unanchored search would pass even with the
# <head> metadata deleted entirely (verified with a negative control).
contains "title tag"                    "<title>Moses Mentoring Foundation</title>"
contains "description meta"             'name="description"'
contains "description meta mentions mentorship" 'name="description" content="Moses Mentoring Foundation identifies and empowers young talent through mentorship'
contains "canonical link"               'rel="canonical"'
contains "canonical on prod domain"     'rel="canonical" href="https://www.mosesmentoringfoundation.org'
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
  # Positive assertion, not `absent`. An `absent` whose pattern depends on
  # Next's exact attribute order is vacuous by default: if the emitted markup
  # ever shifts, it passes forever while telling you nothing.
  contains "og:image on prod domain"    'content="https://www.mosesmentoringfoundation.org/opengraph-image'
else
  printf '  skip  no localhost in social tags (dev; use SMOKE_PROD=1 vs next start)\n'
fi

echo "-- regression guards with no other coverage"
# commit bc3d229's whole premise is self-hosted fonts. A reintroduced @import
# would be invisible to every other layer of this safety net.
absent   "no external font requests"    "fonts.googleapis.com"
absent   "no external font host"        "fonts.gstatic.com"
# RETIRED 25 August 2026. Four assertions here previously required that
# #6C0FD6, #14A38B, #F97C1C and "Plus Jakarta Sans" never appear, enforcing the
# 20 August decision to render the blog in the site's own tokens. That decision
# was reversed: the blog prototype is built to the mockup palette so it matches
# what the client has already been shown. The assertions were deleted rather
# than left failing — a permanently red check is how a safety net stops being
# trusted. Reverting the palette means restoring these four lines.
#
# 27 Aug 2026: the blog was reskinned onto the site palette and the legacy
# tokens were deleted with the twelve components that used them. The canary
# below now watches a REDESIGN token — its job was never royal-purple
# specifically, it was "is Tailwind reading tailwind.config.js at all".

# The legal name is "Moses Mentoring Foundation" (client, 27 Aug 2026). The
# metadata said "Moses of Africa Mentoring Foundation" while every page
# rendered the shorter form — for a month, in the tab title and the OG card.
# Both now read from SITE.legalName.
#
# The domain is mosesmentoringfoundation.org (www). It is the address, not
# the name. It needs no exclusion here: the search term has
# spaces and a hostname does not, so a URL can never match it. An earlier
# version of this check stripped URLs first; the strip was proven to change
# nothing and was removed rather than left implying a protection it did not
# provide.
name_drift=$(grep -oi 'Moses of Africa' <<< "$html" | wc -l | tr -d ' ')
if [ "$name_drift" = "0" ]; then
  pass "legal name is consistent (no 'Moses of Africa' in the markup)"
else
  fail "legal name is consistent (found $name_drift use(s) of the old name)"
fi

echo "-- file-convention assets actually resolve"
resolves "favicon resolves"             '/icon[^" ]*\.jpg[^" ]*' "image/"
resolves "manifest resolves"            '/manifest\.json' "application/"

echo "-- stylesheet"
# Turbopack (the default bundler as of Next.js 16) emits CSS under
# /_next/static/chunks/, not the classic webpack /_next/static/css/ path.
#
# ALL linked stylesheets are concatenated before asserting, not just the first.
# Once the blog routes landed the homepage began emitting more than one chunk,
# and their order varies between runs — so `head -1` picked a different file
# each time and the brand-token check failed roughly half the time. That looked
# like flakiness; it was the assertion reading the wrong file.
css_paths=$(grep -o '/_next/static/\(css\|chunks\)/[^"]*\.css' <<< "$html" | sort -u)
if [ -z "$css_paths" ]; then
  fail "stylesheet linked"
else
  pass "stylesheet linked ($(grep -c . <<< "$css_paths") file(s))"
  css=""
  for cp in $css_paths; do
    css="$css$(curl -fsS --max-time 20 "$BASE$cp" 2>/dev/null)"
  done

  # Tailwind emits custom colours as space-separated rgb triplets, not hex:
  # green-900 #0D3B26 -> "13 59 38". Matching hex here would never pass.
  if grep -q '13 59 38' <<< "$css"; then
    pass "brand token green-900 compiled"
  else
    fail "brand token green-900 compiled (Tailwind not processing config)"
  fi

  # The retired palette must not come back with a stray import.
  if grep -qE '109, ?40, ?217|6d28d9|20 184 166' <<< "$css"; then
    fail "no retired purple/teal tokens in the stylesheet"
  else
    pass "no retired purple/teal tokens in the stylesheet"
  fi

  # Unprocessed directives in the STYLESHEET mean PostCSS is not wired up.
  # This must test the CSS, not the HTML — Next never inlines source CSS text
  # into markup, so checking the page body could never fail.
  if grep -q '@tailwind' <<< "$css"; then
    fail "no raw tailwind directives (PostCSS did not process the layers)"
  else
    pass "no raw tailwind directives"
  fi

  # Under CRA, preflight was emitted twice because index.css and App.css each
  # imported the Tailwind layers. Exactly one copy is required — a regression
  # to 2 is the specific bug this migration set out to fix, so this gates on
  # equality, not presence. grep -c counts LINES, and minified production CSS
  # is one line, so occurrences must be counted with grep -o | wc -l.
  boxsizing=$(grep -oE 'box-sizing:[[:space:]]*border-box' <<< "$css" | wc -l | tr -d ' ')
  if [ "$boxsizing" -eq 1 ]; then
    pass "preflight emitted exactly once"
  else
    fail "preflight emitted exactly once (found $boxsizing copies; expected 1)"
  fi
fi

echo "-- evidence figures (client-corrected, spec §6)"
contains "300+ lives touched"           "300+"
contains "10+ active mentors"           "10+"
contains "where we work is a place"     "NIGERIA"
# The matrix must stay EVIDENCE rather than decoration, which needs two
# things: a visible caption, and an accessible reading of what the marks mean.
#
# This used to pin the caption's exact wording ("solid marks, 10 mentees
# each"), so re-writing that line as mission copy failed the check against a
# page that was perfectly fine. The wording is content and will change again;
# what must not change is that both parts are present.
if grep -qE 'class="sr-only">[0-9]+ or more lives touched, shown as [0-9]+ marks of [0-9]+ each' <<< "$html"; then
  pass "dot matrix has an accessible reading of the marks"
else
  fail "dot matrix has an accessible reading of the marks"
fi
matrix_caption=$(grep -o 'max-w-\[620px\][^>]*>[^<]\{20,\}' <<< "$html" | wc -l | tr -d ' ')
if [ "$matrix_caption" -ge 1 ]; then
  pass "dot matrix carries a visible caption"
else
  fail "dot matrix carries a visible caption (graphic would be decoration, not evidence)"
fi
# "10+ countries reached" was removed deliberately: international reach is a
# future claim, not a current one. It must never come back.
absent   "no country count"             "countries reached"

echo "-- SDG grid (spec §6: the denominator is the point)"
# All seventeen goals must render, not just the seven addressed. Showing only
# the seven would hide the denominator, which is what "seven of seventeen"
# means. Counted from the grid's own markup.
# Counted from the screen-reader announcements rather than the markup: each
# tile emits "Goal N: <full title>." exactly once, and that is the output the
# spec actually requires. Structural counts kept hitting the RSC payload.
sdg_count=$(grep -oE 'Goal [0-9]+:' <<< "$html" | sort -u | wc -l | tr -d ' ')
if [ "$sdg_count" -eq 17 ]; then
  pass "all 17 SDG goals render (denominator visible)"
else
  fail "all 17 SDG goals render (found $sdg_count, expected 17)"
fi
# Abbreviated labels must not lose the official title (spec §6).
contains "full SDG titles announced"    "Peace, Justice and Strong Institutions"
contains "SDG out-of-scope announced"   "Out of scope."

echo "-- institutional alignment"
contains "alignment: United Nations"    "United Nations"
contains "alignment: Save the Children" "Save the Children"
contains "partnership brief link"       "Request our partnership brief"

echo "-- vision"
contains "vision verbatim"              "To build a continent where every young African has access"
contains "woven pull-quote"             "I came in able to speak"

echo "-- redesign typefaces (spec v2.0 §2)"
# Big Shoulders and Manrope replace Outfit, Inter and Plus Jakarta Sans.
# Asserted on the compiled CSS because next/font emits @font-face there, not
# in the markup. The three retired families are NOT asserted absent yet — the
# old components still use them until Task 11 deletes them.
if grep -q 'Big Shoulders' <<< "$css"; then
  pass "Big Shoulders Display loaded"
else
  fail "Big Shoulders Display loaded"
fi
if grep -q 'Manrope' <<< "$css"; then
  pass "Manrope loaded"
else
  fail "Manrope loaded"
fi
# Square is the system default (spec §2 Layout). rounded-full survives for
# rings and avatars; every other radius token resolves to 0.
# The rule spans lines in dev-mode CSS and grep is line-based, so flatten
# first.
#
# This used to test `.rounded-2xl`. Once the legacy components were deleted no
# source file used that class any more, so Tailwind stopped emitting it and the
# assertion failed against a perfectly square site — testing a class nothing
# uses proves nothing either way. It now tests the two facts that matter:
# the preloader spinner is still a circle, and no rule anywhere carries a
# rounded corner.
#
# Nothing uses the `rounded-full` UTILITY any more either — the only circles
# left are the spinner rings, drawn with border-radius:50% in plain CSS. So
# the circle check reads the rule that actually exists rather than a Tailwind
# class that is no longer emitted.
css_flat=$(tr -d '\n' <<< "$css")
if grep -qE '\.moa-preloader__spinner:{1,2}(before|after)[^{}]*\{[^}]*border-radius: *50%' <<< "$css_flat"; then
  pass "preloader rings are still circles"
else
  fail "preloader rings are still circles"
fi

# Any border-radius with a non-zero, non-9999px value means a rounded corner
# got back in — either a new arbitrary value or a restored config entry.
stray=$(grep -oE 'border-radius: *[^;0][^;]*' <<< "$css_flat" \
        | grep -vE '9999px|50%|0px|: *0' | sort -u | head -5)
if [ -z "$stray" ]; then
  pass "no rounded corners anywhere in the stylesheet"
else
  fail "no rounded corners anywhere in the stylesheet (found: $(tr '\n' ' ' <<< "$stray"))"
fi

# Manual-QA findings, 27 Aug 2026 — both were real and both are cheap to keep.
echo "-- structure"

# 1. Heading levels must not skip. The four blog category pages went h1 -> h3
#    because the cards under the page title were h3; heading-level navigation
#    is how a screen-reader user scans a list, and the gap breaks it.
skipped=""
for r in / /about /programs /programs/apply /programs/mentor /donate /contact \
         /gallery /blog /blog/category/partnerships /blog/category/summits \
         /blog/embassy-of-kuwait-youth-education-partnership; do
  levels=$(curl -fsS --max-time 20 "$BASE$r" 2>/dev/null | sed 's/<!-- -->//g' \
           | grep -oE '<h[1-6]' | grep -oE '[1-6]' | tr '\n' ' ')
  prev=0
  for l in $levels; do
    if [ "$prev" -ne 0 ] && [ "$l" -gt $((prev + 1)) ]; then
      skipped="$skipped [$r: h$prev->h$l]"
      break
    fi
    prev=$l
  done
done
[ -z "$skipped" ] && pass "no page skips a heading level" \
  || fail "no page skips a heading level ($skipped)"

# 2. No drop shadows (spec §2). Tailwind's scanner reads raw file text
#    INCLUDING comments, so the bare utility name written in prose is enough to
#    emit the utility. That is exactly how a .shadow rule got into the bundle.
if grep -oE 'box-shadow: *[^;]*' <<< "$css" | grep -qv 'none'; then
  fail "no drop shadows in the stylesheet"
else
  pass "no drop shadows in the stylesheet"
fi

# The mobile menu shipped permanently open. `hidden={!open}` looks like it
# hides the panel, but the UA rule is `[hidden] { display: none }` and the
# `flex` utility beside it is author-origin at equal specificity — author
# wins, so the panel covered the page at every viewport and the close button
# had nothing to do. Display is now toggled by CLASS. This asserts the closed
# state: the attribute present, and no bare `flex` class to override it.
menu=$(grep -o 'id="mobile-menu"[^>]*' <<< "$html" | head -1)
if [ -z "$menu" ]; then
  fail "mobile menu is present in the markup"
else
  pass "mobile menu is present in the markup"
  menu_classes=$(grep -o 'class="[^"]*"' <<< "$menu" | sed 's/class="//;s/"$//')
  has_flex=$(tr ' ' '\n' <<< "$menu_classes" | grep -cx 'flex')
  has_hidden=$(tr ' ' '\n' <<< "$menu_classes" | grep -cx 'hidden')
  if grep -q 'hidden=""' <<< "$menu" && [ "$has_hidden" -ge 1 ] && [ "$has_flex" -eq 0 ]; then
    pass "mobile menu is closed on load (hidden attr + hidden class, no flex)"
  else
    fail "mobile menu is closed on load (attr=$(grep -c 'hidden=\"\"' <<< "$menu") hidden-class=$has_hidden flex-class=$has_flex)"
  fi
fi

# The record figures animate on scroll. The SERVER must still render the real
# numbers — someone with JavaScript off has to see 300, not 0, and these are
# the figures the client corrected.
zeroed=$(grep -oE 'tabular-nums[^>]*>0\+?<' <<< "$html" | wc -l | tr -d ' ')
if [ "$zeroed" = "0" ]; then
  pass "animated figures server-render their real values"
else
  fail "animated figures server-render their real values ($zeroed rendered as 0)"
fi

# The objectives header carried a "Full programme document" call to action
# over its photograph, pointing at a document that does not exist.
if grep -qi 'programme document' <<< "$html"; then
  fail "no link to a programme document that does not exist"
else
  pass "no link to a programme document that does not exist"
fi

# Heroes and photographic headers must use MIN-height with their copy in
# normal flow. With a fixed `h-[...]` and the copy in an `absolute inset-y-0`
# layer, the copy contributes nothing to the box and simply spills out of it
# over the sections either side. /programs/mentor did exactly that at 390px —
# ~414px of content in a 300px box.
overflowable=""
for r in / /about /programs /programs/apply /programs/mentor /donate /contact /blog; do
  page=$(curl -fsS --max-time 20 "$BASE$r" 2>/dev/null)
  # a fixed-height box that also contains an absolutely positioned inset-y-0
  # text layer is the shape that fails
  if grep -qE 'class="relative (flex )?bg-ink-900 h-\[[0-9]+px\]' <<< "$page" \
     || grep -qE 'class="relative h-\[[0-9]+px\] bg-ink-900' <<< "$page"; then
    overflowable="$overflowable [$r]"
  fi
done
[ -z "$overflowable" ] && pass "heroes size to their content (min-h, not h)" \
  || fail "heroes size to their content (fixed height on:$overflowable)"

# No age limit in any eligibility statement (client, 27 Aug 2026). The mentee
# card claimed 16-30 while the FAQ named no limit and the form accepted 10-99.
# "under 18" is deliberately NOT matched — that line is about guardian
# consent, not eligibility, and it stays.
agecap=""
for r in / /programs /programs/apply /contact; do
  page=$(curl -fsS --max-time 20 "$BASE$r" 2>/dev/null | sed 's/<!-- -->//g')
  if grep -qEi 'aged [0-9]|ages? of [0-9]|between [0-9]+ and [0-9]+|[0-9]+ *(to|-|–) *[0-9]+ *(year|yr)' <<< "$page"; then
    agecap="$agecap [$r]"
  fi
done
[ -z "$agecap" ] && pass "no age limit in eligibility copy" \
  || fail "no age limit in eligibility copy (found:$agecap)"

# No application deadline anywhere (client, 27 Aug 2026). A published closing
# date goes stale the moment it passes and nobody remembers to edit it — the
# mentee card carried "applications for cohort five close 30 November" long
# after that would have meant anything. Scoped to closing dates so the
# legitimate "As of August 2026" on the evidence band still passes.
MONTHS='January|February|March|April|May|June|July|August|September|October|November|December'
deadlines=""
for r in / /programs /programs/apply /programs/mentor; do
  page=$(curl -fsS --max-time 20 "$BASE$r" 2>/dev/null | sed 's/<!-- -->//g')
  if grep -qEi "clos(e|es|ing)[^.<]{0,24}($MONTHS)|($MONTHS)[^.<]{0,12}deadline|deadline[^.<]{0,24}($MONTHS)" <<< "$page"; then
    deadlines="$deadlines [$r]"
  fi
done
[ -z "$deadlines" ] && pass "no application deadline published" \
  || fail "no application deadline published (found:$deadlines)"

echo "-- /about"
about=$(curl -fsS --max-time 20 "$BASE/about" 2>/dev/null | sed 's/<!-- -->//g') || about=""
if [ -z "$about" ]; then
  fail "/about responds"
else
  pass "/about responds"
  grep -qF 'To inspire guide and equip African youths' <<< "$about" \
    && pass "about: mission verbatim" || fail "about: mission verbatim"
  grep -qF 'To build a continent where every young African' <<< "$about" \
    && pass "about: vision verbatim" || fail "about: vision verbatim"
  grep -qF 'Accountability' <<< "$about" \
    && pass "about: five values" || fail "about: five values"
  # The record must read from the same source as the homepage — two hand-typed
  # copies is how 500+ survived on one page after correction on another.
  grep -qF 'NIGERIA' <<< "$about" \
    && pass "about: record shares the homepage figures" \
    || fail "about: record shares the homepage figures"
  grep -qF 'countries reached' <<< "$about" \
    && fail "about: no country count" || pass "about: no country count"
fi

echo "-- /programs"
progs=$(curl -fsS --max-time 20 "$BASE/programs" 2>/dev/null | sed 's/<!-- -->//g') || progs=""
if [ -z "$progs" ]; then
  fail "/programs responds"
else
  pass "/programs responds"
  for name in Leadership Education Enterprise advocacy; do
    grep -qF "$name" <<< "$progs" \
      && pass "programs: $name band" || fail "programs: $name band"
  done
  # Band 03 has no photograph — none of the client images depicts enterprise
  # work, so it is a typographic panel. An unrelated image must never be
  # substituted (spec §5).
  grep -qF 'Encouraging creativity and forward-thinking' <<< "$progs" \
    && pass "programs: band 03 is a typographic panel" \
    || fail "programs: band 03 is a typographic panel"
  grep -qF 'Ask about this programme' <<< "$progs" \
    && pass "programs: enquiry action on each band" \
    || fail "programs: enquiry action on each band"
fi

echo "-- /programs/apply and /programs/mentor"
apply=$(curl -fsS --max-time 20 "$BASE/programs/apply" 2>/dev/null | sed 's/<!-- -->//g') || apply=""
mentor=$(curl -fsS --max-time 20 "$BASE/programs/mentor" 2>/dev/null | sed 's/<!-- -->//g') || mentor=""

if [ -z "$apply" ]; then
  fail "/programs/apply responds"
else
  pass "/programs/apply responds"
  missing=""
  for f in name age email phone country city programme motivation referral consent; do
    grep -qF "name=\"$f\"" <<< "$apply" || missing="$missing $f"
  done
  [ -z "$missing" ] && pass "apply: all 10 mentee fields" \
    || fail "apply: all 10 mentee fields (missing:$missing)"
  grep -qF 'not yet being received' <<< "$apply" \
    && pass "apply: submission stub is disclosed" \
    || fail "apply: submission stub is disclosed"
fi

if [ -z "$mentor" ]; then
  fail "/programs/mentor responds"
else
  pass "/programs/mentor responds"
  missing=""
  for f in name email country field availability motivation consent; do
    grep -qF "name=\"$f\"" <<< "$mentor" || missing="$missing $f"
  done
  [ -z "$missing" ] && pass "mentor: all 7 enquiry fields" \
    || fail "mentor: all 7 enquiry fields (missing:$missing)"
  # The "what we do not require" column is the persuasive half of this page —
  # most people who would be good at it rule themselves out. Do not demote it.
  grep -qF 'What we do not require' <<< "$mentor" \
    && pass "mentor: the persuasive column survives" \
    || fail "mentor: the persuasive column survives"
fi

# Programme logistics were removed from the public site at the client's
# request — cycle length, session frequency, group size, ratios, per-place
# cost. They must not creep back from an older mockup.
both="$apply$mentor"
leaked=""
for term in "cycle length" "session frequency" "group size" "per place" "mentee-per-mentor"; do
  grep -qiF "$term" <<< "$both" && leaked="$leaked [$term]"
done
[ -z "$leaked" ] && pass "no programme logistics on the public site" \
  || fail "no programme logistics on the public site (found:$leaked)"

echo "-- /donate and /contact"
donate=$(curl -fsS --max-time 20 "$BASE/donate" 2>/dev/null | sed 's/<!-- -->//g') || donate=""
contact=$(curl -fsS --max-time 20 "$BASE/contact" 2>/dev/null | sed 's/<!-- -->//g') || contact=""

if [ -z "$donate" ]; then
  fail "/donate responds"
else
  pass "/donate responds"
  missing=""
  for f in name email phone designation note; do
    grep -qF "name=\"$f\"" <<< "$donate" || missing="$missing $f"
  done
  [ -z "$missing" ] && pass "donate: all 5 fields" \
    || fail "donate: all 5 fields (missing:$missing)"

  # The designation options must match the three areas the page just described.
  # Both come from GIVING_AREAS in src/lib/content.ts; this catches anyone who
  # re-hardcodes one of the two lists and lets them drift.
  drift=""
  for area in "Mentoring cycles" "Education access" "Outreach and advocacy"; do
    grep -qF "value=\"$area\"" <<< "$donate" || drift="$drift [$area]"
  done
  [ -z "$drift" ] && pass "donate: designations match the stated areas" \
    || fail "donate: designations match the stated areas (missing:$drift)"

  grep -qF 'No payment is taken on this website' <<< "$donate" \
    && pass "donate: the no-payment statement is present" \
    || fail "donate: the no-payment statement is present"

  # ...and that statement must stay TRUE. No card, CVV, expiry or amount field
  # may appear while it is on the page. If a gateway is ever integrated, remove
  # the sentence in the same change — a donate page that claims it takes no
  # payment while collecting card details is the worst failure this site could
  # ship, and it would look like a phishing form to anyone who noticed.
  takes_payment=""
  for f in card cardnumber cc-number cvv cvc expiry amount; do
    grep -qiF "name=\"$f\"" <<< "$donate" && takes_payment="$takes_payment [$f]"
  done
  [ -z "$takes_payment" ] && pass "donate: takes no payment, as it states" \
    || fail "donate: takes no payment, as it states (found:$takes_payment)"
fi

if [ -z "$contact" ]; then
  fail "/contact responds"
else
  pass "/contact responds"
  missing=""
  for f in subject name email phone country message; do
    grep -qF "name=\"$f\"" <<< "$contact" || missing="$missing $f"
  done
  [ -z "$missing" ] && pass "contact: all 6 fields" \
    || fail "contact: all 6 fields (missing:$missing)"

  # The old site printed the phone number as plain text in the footer and as a
  # different, real number in the donation drawer. Both are now SITE constants,
  # and on this page both must be tappable — a phone number you cannot tap on a
  # phone is the single most annoying thing a contact page can do.
  if grep -qF 'mailto:mosesofafrica@gmail.com' <<< "$contact" \
     && grep -qF 'tel:+2348037315490' <<< "$contact"; then
    pass "contact: email and phone are actionable links"
  else
    fail "contact: email and phone are actionable links"
  fi
fi

echo "-- /gallery"
gal=$(curl -fsS --max-time 20 "$BASE/gallery" 2>/dev/null | sed 's/<!-- -->//g') || gal=""
galsum=$(curl -fsS --max-time 20 "$BASE/gallery?category=Summits" 2>/dev/null | sed 's/<!-- -->//g') || galsum=""
galall=$(curl -fsS --max-time 20 "$BASE/gallery?show=24" 2>/dev/null | sed 's/<!-- -->//g') || galall=""

tiles() { grep -o '<li class="relative' <<< "$1" | wc -l | tr -d ' '; }

if [ -z "$gal" ]; then
  fail "/gallery responds"
else
  pass "/gallery responds"

  n=$(tiles "$gal")
  [ "$n" = "12" ] && pass "gallery: first page renders 12 tiles" \
    || fail "gallery: first page renders 12 tiles (got $n)"

  missing=""
  for c in All "Courtesy visits" Summits Governance Advocacy Engagements; do
    grep -qF ">$c<" <<< "$gal" || missing="$missing [$c]"
  done
  [ -z "$missing" ] && pass "gallery: all 6 category filters present" \
    || fail "gallery: all 6 category filters present (missing:$missing)"

  # Filtering is server-rendered on purpose (see PhotoGrid). These two prove
  # it works with JavaScript off — a client-filtered grid would pass a naive
  # "the tabs are on the page" check while filtering nothing.
  n=$(tiles "$galsum")
  if [ "$n" = "1" ] && grep -qF 'Showing 1 of 1 photograph' <<< "$galsum"; then
    pass "gallery: category filter works without JavaScript"
  else
    fail "gallery: category filter works without JavaScript (got $n tiles)"
  fi

  n=$(tiles "$galall")
  [ "$n" = "19" ] && pass "gallery: load-more reveals all 19 without JavaScript" \
    || fail "gallery: load-more reveals all 19 without JavaScript (got $n)"

  # The alt text is the only record of what each photograph shows, and these
  # are real diplomatic engagements. Vague alts ("at an embassy") lose that.
  missing=""
  for inst in "Embassy of Vietnam" "Nigeria Police Force" "Chiefs of Defence Staff"; do
    grep -qF "$inst" <<< "$galall" || missing="$missing [$inst]"
  done
  [ -z "$missing" ] && pass "gallery: alt text names the real engagements" \
    || fail "gallery: alt text names the real engagements (missing:$missing)"

  # No capture dates exist for these photographs, so the mockup's year filter
  # is deliberately not built. If one appears, it was guessed.
  # Match the control, not the digits — "2026" also appears in the footer
  # copyright, which an earlier version of this check matched by accident.
  if grep -qE 'name="year"|[?&]year=|2026 \xe2\x96\xbe' <<< "$gal"; then
    fail "gallery: no year filter until real dates exist"
  else
    pass "gallery: no year filter until real dates exist"
  fi

  # Query strings come from anywhere. Bad ones must fall back, not 500.
  bad=""
  for q in "category=Nonsense" "show=-1" "show=abc" "show=0"; do
    code=$(curl -s -o /dev/null --max-time 20 -w '%{http_code}' "$BASE/gallery?$q")
    [ "$code" = "200" ] || bad="$bad [$q=$code]"
  done
  [ -z "$bad" ] && pass "gallery: bad query strings fall back to defaults" \
    || fail "gallery: bad query strings fall back to defaults ($bad)"
fi

echo "-- /admin"
# The admin area must never be indexed, and must never be reachable by
# following a link from the public site. The auth redirect itself cannot be
# asserted here: it needs real Supabase credentials, which this script does not
# have and should not have. That part is a manual check — see the QA list.
# /admin must BOUNCE an anonymous request to the login page. This used to
# assert a noindex tag on /admin, which only passed while the environment was
# unconfigured and the page rendered a placeholder — the moment real
# credentials arrived the route started redirecting, there was no body, and
# the check failed against correct behaviour. Asserting the redirect tests the
# thing that actually matters.
admin_code=$(curl -s -o /dev/null --max-time 20 -w '%{http_code}' "$BASE/admin")
admin_to=$(curl -s -o /dev/null --max-time 20 -w '%{redirect_url}' "$BASE/admin")
case "$admin_code" in
  30[1278])
    if grep -q '/admin/login' <<< "$admin_to"; then
      pass "/admin bounces an anonymous request to the login page"
    else
      fail "/admin bounces an anonymous request to the login page (went to $admin_to)"
    fi ;;
  200)
    # Only legitimate with no Supabase configured, where it renders a notice.
    if curl -fsS --max-time 20 "$BASE/admin" | grep -qi 'not configured'; then
      pass "/admin renders the unconfigured notice (no credentials present)"
    else
      fail "/admin served content to an anonymous request (expected a redirect)"
    fi ;;
  *) fail "/admin responds (got $admin_code)" ;;
esac

# Every admin route, not just the index. A new page under /admin that forgets
# the guard is the failure mode this catches.
unguarded=""
for r in /admin/posts/new "/admin/posts/embassy-of-kuwait-youth-education-partnership"; do
  code=$(curl -s -o /dev/null --max-time 20 -w '%{http_code}' "$BASE$r")
  to=$(curl -s -o /dev/null --max-time 20 -w '%{redirect_url}' "$BASE$r")
  case "$code" in
    30[1278]) grep -q '/admin/login' <<< "$to" || unguarded="$unguarded [$r->$to]" ;;
    200) curl -fsS --max-time 20 "$BASE$r" | grep -qi 'not configured' || unguarded="$unguarded [$r served content]" ;;
    404) ;;  # a slug that does not exist here is fine
    *) unguarded="$unguarded [$r=$code]" ;;
  esac
done
[ -z "$unguarded" ] && pass "every /admin route is behind the guard" \
  || fail "every /admin route is behind the guard ($unguarded)"

login=$(curl -fsS --max-time 20 "$BASE/admin/login" 2>/dev/null) || login=""
if [ -z "$login" ]; then
  fail "/admin/login responds"
else
  pass "/admin/login responds"
  grep -q 'name="robots" content="noindex' <<< "$login" \
    && pass "/admin/login is noindex" \
    || fail "/admin/login is noindex (it would appear in search results)"
fi

# No route the public can reach should advertise the admin area.
leaked=""
for r in / /about /programs /donate /contact /gallery /blog; do
  page=$(curl -fsS --max-time 20 "$BASE$r" 2>/dev/null | sed 's/<!-- -->//g')
  grep -qE 'href="/admin' <<< "$page" && leaked="$leaked [$r]"
done
[ -z "$leaked" ] && pass "no public page links to /admin" \
  || fail "no public page links to /admin (found:$leaked)"

# Controls must be controls. "Reply", "Share" and "Copy link" all shipped as
# <span>s carrying comments calling them presentational — styled like buttons,
# labelled with verbs, doing nothing. A reader cannot tell the difference until
# they click. This catches the next one.
post_html=$(curl -fsS --max-time 20 "$BASE/blog/embassy-of-kuwait-youth-education-partnership" 2>/dev/null | sed 's/<!-- -->//g')
if [ -n "$post_html" ]; then
  fake=""
  for verb in Share "Copy link" Reply; do
    # present as a label, but NOT as a button
    if grep -qF ">$verb<" <<< "$post_html" && ! grep -qF "$verb</button>" <<< "$post_html"; then
      fake="$fake [$verb]"
    fi
  done
  [ -z "$fake" ] && pass "blog controls are real controls, not styled spans" \
    || fail "blog controls are real controls, not styled spans (inert:$fake)"
fi

echo "-- blog routes"
# The blog is server-rendered from fixtures. These fetch their own pages, so
# they use a local variable rather than the shared $html.
blog=$(curl -fsS --max-time 20 "$BASE/blog" 2>/dev/null) || blog=""
if [ -z "$blog" ]; then
  fail "/blog responds"
else
  pass "/blog responds"
  # Strip React's comment markers first: {value} interpolation serialises as
  # "+<!-- -->15", so a naive search for rendered text finds nothing.
  blog_txt=$(sed 's/<!-- -->//g' <<< "$blog")
  if grep -qF 'Stories &amp; Activities' <<< "$blog_txt"; then
    pass "blog index heading server-rendered"
  else
    fail "blog index heading server-rendered"
  fi
  if grep -qF 'Courtesy visit to the Embassy of Kuwait' <<< "$blog_txt"; then
    pass "featured post server-rendered"
  else
    fail "featured post server-rendered"
  fi
  if grep -qF 'Filter posts by category' <<< "$blog_txt"; then
    pass "category filter present"
  else
    fail "category filter present"
  fi
fi

post=$(curl -fsS --max-time 20 "$BASE/blog/embassy-of-kuwait-youth-education-partnership" 2>/dev/null) || post=""
if [ -z "$post" ]; then
  fail "single post responds"
else
  pass "single post responds"
  post_txt=$(sed 's/<!-- -->//g' <<< "$post")
  # Body copy in the initial HTML is the whole point of server rendering it.
  if grep -qF 'Embassy of the State of Kuwait in Abuja' <<< "$post_txt"; then
    pass "post body server-rendered"
  else
    fail "post body server-rendered"
  fi
  if grep -qF 'Be kind — our team removes abuse' <<< "$post_txt"; then
    pass "comment composer present"
  else
    fail "comment composer present"
  fi
  # Spec §8: staff Delete must be ABSENT from the public DOM, not hidden.
  # There is no auth in the prototype, so it must never appear.
  if grep -qE '>[[:space:]]*Delete[[:space:]]*<' <<< "$post_txt"; then
    fail "no staff Delete in public DOM (spec §8)"
  else
    pass "no staff Delete in public DOM (spec §8)"
  fi
fi

# Reskin (27 Aug 2026): the blog now shares the site palette and typefaces.
# blog.css and BlogScope are deleted, so a regression here is not a tweak —
# it means a component is still carrying the retired prototype identity.
if [ -n "$blog" ] && [ -n "$post" ]; then
  stale=""
  for token in "6C0FD6" "6c0fd6" "14A38B" "14a38b" "Jakarta" "15,22,38"; do
    grep -qF "$token" <<< "$blog$post" && stale="$stale [$token]"
  done
  [ -z "$stale" ] && pass "blog carries no retired prototype palette" \
    || fail "blog carries no retired prototype palette (found:$stale)"

  # One <main> per page. The blog pages used to render their own inside the
  # root layout's, giving screen readers two competing landmarks.
  n=$(grep -o '<main' <<< "$blog" | wc -l | tr -d ' ')
  [ "$n" = "1" ] && pass "blog index has exactly one <main>" \
    || fail "blog index has exactly one <main> (got $n)"

  # The blog used to be a dead end with no way back into the site.
  grep -qF 'Moses Mentoring Foundation' <<< "$blog" \
    && pass "blog renders inside the site shell" \
    || fail "blog renders inside the site shell"

  # The previous fixtures invented impact figures for a real charity. They
  # must not come back with a copy-paste from an old mockup.
  invented=""
  for claim in "120 out-of-school" "300 pupils" "500+"; do
    grep -qiF "$claim" <<< "$blog$post" && invented="$invented [$claim]"
  done
  [ -z "$invented" ] && pass "no invented impact figures on the blog" \
    || fail "no invented impact figures on the blog (found:$invented)"
fi

# Every category in the union must resolve — a nav item pointing at a 404 is
# how the old site's commented-out BLOG link behaved.
missing=""
for c in partnerships governance advocacy summits; do
  code=$(curl -o /dev/null -s -w '%{http_code}' --max-time 20 "$BASE/blog/category/$c")
  [ "$code" = "200" ] || missing="$missing [$c=$code]"
done
[ -z "$missing" ] && pass "all 4 blog categories resolve" \
  || fail "all 4 blog categories resolve ($missing)"

cat_status=$(curl -o /dev/null -s -w '%{http_code}' --max-time 20 "$BASE/blog/category/partnerships")
if [ "$cat_status" = "200" ]; then
  pass "category route responds ($cat_status)"
else
  fail "category route responds (got $cat_status)"
fi
# An unknown category must 404, not render an empty list implying it exists.
bad_status=$(curl -o /dev/null -s -w '%{http_code}' --max-time 20 "$BASE/blog/category/not-a-real-category")
if [ "$bad_status" = "404" ]; then
  pass "unknown category 404s ($bad_status)"
else
  fail "unknown category 404s (got $bad_status)"
fi

echo
if [ "$FAILURES" -eq 0 ]; then
  echo "PASS — all checks green"
  exit 0
fi
echo "FAIL — $FAILURES check(s) failed"
exit 1
