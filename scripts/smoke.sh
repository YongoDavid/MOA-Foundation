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

html=$(curl -fsS --max-time 20 "$BASE/") || {
  echo "FATAL: could not fetch $BASE/ — is the server running?"
  exit 1
}

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
contains "title tag"                    "<title>Moses of Africa Mentoring Foundation</title>"
contains "description meta"             'name="description"'
contains "description meta mentions mentorship" 'name="description" content="Moses of Africa Mentoring Foundation identifies and empowers young talent through mentorship'
contains "canonical link"               'rel="canonical"'
contains "canonical on prod domain"     'rel="canonical" href="https://mosesofafricafoundation.org'
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
  contains "og:image on prod domain"    'content="https://mosesofafricafoundation.org/opengraph-image'
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
# `brand token royal-purple compiled` below is deliberately kept: the homepage
# still uses site tokens, so it now guards the two palettes coexisting.

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

  if grep -q '6d28d9' <<< "$css"; then
    pass "brand token royal-purple compiled"
  else
    fail "brand token royal-purple compiled (Tailwind not processing config)"
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

cat_status=$(curl -o /dev/null -s -w '%{http_code}' --max-time 20 "$BASE/blog/category/mentorship")
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
