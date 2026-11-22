# state-map.sh — where the shop keeps its state, and who reads it (npm run state-map)
cd "$(dirname "$0")/../src"
n() { grep -rhoE "$1" --include=*.ts --include=*.tsx . | wc -l | tr -d ' '; }
files() { grep -rlE "$1" --include=*.tsx . | sed 's|^\./||' | sort | tr '\n' ' '; }
echo "useState $(n 'useState[<(]') · useReducer $(n 'useReducer\(') · Context $(n 'createContext[<(]') · stores $(n '= create(Store)?<') · localStorage keys $(grep -cE "^  [a-z]+: 'siraj-shop:" storage.ts) · URL $(n 'use(Search)?Params\(\)')"
echo "cart   owner: $(grep -rlE 'create<Cart' --include=*.ts . | sed 's|^\./||')"
echo "cart   reads: $(files 'useCart(Store)?\(')"
echo "dark   owner: $(files 'STORAGE.dark')"
echo "search owner: $(files "useState\(''\)|useSearchParams\(\)")"
owners=$(grep -rlE "useState[<(]|useSearchParams\(|= create(Store)?<|useLocalStorage\(STORAGE" --include=*.tsx --include=*.ts . | grep -v -e test -e '^./hooks/' | sed 's|^\./||' | sort)
doc=../docs/STATE.md; missing=""; n=0; total=0
for f in $owners; do total=$((total+1)); if [ -f $doc ] && grep -q "$f" $doc; then n=$((n+1)); else missing="$missing $f"; fi; done
echo "documented in docs/STATE.md: $n/$total${missing:+ · missing:$missing}"
