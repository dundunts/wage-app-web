#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

production_sources=(src)
source_filter=(
  -type f
  \( -name '*.ts' -o -name '*.tsx' -o -name '*.css' -o -name '*.scss' \)
  ! -name '*.test.*'
  ! -path 'src/theme/system.ts'
  ! -path 'src/theme/chart.ts'
)

audit_pattern() {
  local label="$1"
  local pattern="$2"
  local matches

  matches=$(find "${production_sources[@]}" "${source_filter[@]}" \
    -exec grep -nHE "$pattern" {} + || true)

  if [[ -n "$matches" ]]; then
    echo "Theme audit failed: $label" >&2
    echo "$matches" >&2
    return 1
  fi
}

audit_pattern \
  "raw CSS colors must live in src/theme/system.ts" \
  '#[[:xdigit:]]{3,8}|rgba?\(|hsla?\(|oklch\(|color-mix\('

audit_pattern \
  "raw Chakra palette steps must be replaced with semantic roles" \
  '(gray|red|orange|yellow|green|teal|blue|cyan|purple|pink|blackAlpha|whiteAlpha)\.(50|100|200|300|400|500|600|700|800|900|950|solid|subtle|muted|emphasized|contrast|focusRing)'

audit_pattern \
  "feature colorPalette values must use project roles" \
  "colorPalette=([\"'](gray|red|orange|yellow|green|teal|blue|cyan|purple|pink)[\"']|\\{[\"'](gray|red|orange|yellow|green|teal|blue|cyan|purple|pink)[\"']\\})"

audit_pattern \
  "native controls must not bypass Chakra presentation" \
  '<(input|select|textarea|button|dialog|progress|meter)([[:space:]>])'

echo "Theme audit passed: production UI uses semantic colors and themed controls."
