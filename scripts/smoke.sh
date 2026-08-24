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

echo "Smoke checking $BASE"

echo "-- scaffold"
contains "page renders"                 "Next.js scaffold live"

echo "-- regressions"
# Static image imports return an object under Next; a bare {import} in src
# serialises as "[object Object]". This is the canary for that whole class.
absent   "no object-serialisation leak"  "[object Object]"
# Unprocessed Tailwind directives mean PostCSS is not wired up.
absent   "no raw tailwind directives"    "@tailwind"

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
  # Under CRA, preflight was emitted twice because index.css and App.css
  # each imported the Tailwind layers. Exactly one copy is expected now.
  # Dev-mode CSS (unminified) keeps a space after the colon; production
  # builds strip it. Tolerate both.
  boxsizing=$(printf '%s' "$css" | grep -Ec 'box-sizing:[[:space:]]*border-box' || true)
  if [ "$boxsizing" -ge 1 ]; then
    pass "preflight present (box-sizing occurrences: $boxsizing)"
  else
    fail "preflight present"
  fi
fi

echo
if [ "$FAILURES" -eq 0 ]; then
  echo "PASS — all checks green"
  exit 0
fi
echo "FAIL — $FAILURES check(s) failed"
exit 1
