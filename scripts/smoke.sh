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

echo "-- stylesheet"
# Turbopack (the default bundler as of Next.js 16) emits CSS under
# /_next/static/chunks/, not the classic webpack /_next/static/css/ path.
# Accept either so this check tracks "is a stylesheet linked at all", not
# "which bundler produced it".
css_path=$(printf '%s' "$html" | grep -o '/_next/static/\(css\|chunks\)/[^"]*\.css' | head -1)
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
