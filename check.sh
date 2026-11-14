#!/bin/bash
# responsive check for the page in this folder: ~/check.sh [WIDTH...]
W="${@:-280 320 375 768 1024 1440}"; fail=0
for w in $W; do
  o=$(node ~/overflow.js $w | sed -n 2p); s=$(node ~/spacing.js $w | head -1 | grep -o 'clipped=[0-9]*')
  t=$(node ~/targets.js $w | tail -1 | grep -o 'too-small=[0-9]*')
  if [ -z "$o" ] && [ "$s" = "clipped=0" ] && [ "$t" = "too-small=0" ]; then echo "PASS ${w}px"; else echo "FAIL ${w}px  ${o:-no overflow}  $s  $t"; fail=1; fi
done
exit $fail
