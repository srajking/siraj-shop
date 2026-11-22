# state-map.sh — where the shop keeps its state, and who reads it (npm run state-map)
cd "$(dirname "$0")/../src"
n() { grep -rhoE "$1" --include=*.ts --include=*.tsx . | wc -l | tr -d ' '; }
files() { grep -rlE "$1" --include=*.tsx . | sed 's|^\./||' | sort | tr '\n' ' '; }
echo "useState $(n 'useState[<(]') · useReducer $(n 'useReducer\(') · Context $(n 'createContext[<(]') · localStorage keys $(grep -cE "^  [a-z]+: 'siraj-shop:" storage.ts) · URL $(n 'use(Search)?Params\(\)')"
echo "cart   owner: $(files 'useLocalReducer\(STORAGE.cart')"
echo "cart   reads: $(files 'useCart\(\)')"
echo "dark   owner: $(files 'STORAGE.dark')"
echo "search owner: $(files "useState\(''\)|useSearchParams\(\)")"
