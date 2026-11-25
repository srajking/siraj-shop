# Changelog

## 10.0.0 — the shop API in PHP

- `php-api/`: the shop API in PHP 8.3, with the same URLs as `server/` through a front controller (`public/index.php`); `check-final.sh` gets the same answers from both: 12 of 12
- The Next site runs on it unchanged: `SHOP_API=http://localhost:8000/api`, health `up`, the 4 end-to-end journeys pass with Node switched off
- Passwords are bcrypt hashes (`data/users.php`), the session cookie is HttpOnly and SameSite, and a login always gets a new session id
- Reviews are checked on the server (empty name, 5000 letters → 422) and saved in `data/reviews.json` under a lock, written whole with `rename`: 20 at the same moment, none lost
- Products are read from `server/data/products.json` — one list for both servers
- An uncaught error answers `500 {"error":"server error","requestId":…}`; the log has the same id and the cause; no `X-Powered-By`
- `composer install` sets up autoloading; `composer lint` checks syntax, `strict_types` and leftover `var_dump` (0 problems)

## 9.0.0 — the shop in Next.js

- The shop is rebuilt in Next.js 16 (App Router), in `site/`: server components read the API on the server, the browser gets HTML first
- Product pages are prerendered and cached (`'use cache'`, tags), reviews stream in fresh; the admin script refreshes a product with `POST /revalidate`, which answers 400/404/401 for mistakes
- Reviews are written through a Server Action: checked with zod, only for logged-in customers (signed, httpOnly session), the name comes from the session
- A missing product is a real 404 (checked by `proxy.ts` before the page streams)
- One cart for every page (Zustand + localStorage), its count in the header, no hydration errors
- Every page has its own title and description; share image, `sitemap.xml` and `robots.txt`
- Streamed parts keep their place (product page CLS 0.024 → 0); real-user Web Vitals collected at `/api/vitals`
- Tests: 6 unit tests (Vitest) and 4 end-to-end journeys (Playwright), one for each promise above
- Settings and secrets come from the environment, checked at start (`lib/env.ts`, `.env.example`); `output: "standalone"` builds a 73 MB server instead of 669 MB of node_modules

## 8.0.0 — state in the right place

- Every piece of state has one owner, written down in `web/docs/STATE.md`; `npm run state-map` counts them and checks the document
- Cart: a Zustand store (`cartStore.ts`) with rules in an RTK slice (`cartSlice.ts`); each component selects only what it shows — one add redraws one card, not every card and shelf
- Cart count and total are memoized selectors: one click computes them once, not four times
- The cart is saved by `persist` with a version, carts saved by 7.x still load, a broken save starts empty, and every open tab shows the same cart
- Search lives in the URL (`?q=`): shareable, kept after a reload, Back works; answers come from TanStack Query (one cache, a minute fresh, no retries for a 500 or a wrong shape)
- Reviews live on the server, per product page: a new review shows at once, stays after a reload, and is taken back with a message if the server refuses (the server now keeps the reviewer's name)
- Smaller redraws: the theme button and the review form own their state; typing a review no longer redraws the reviews
- Tests: 33 (from 13 in 7.0.0); `npm run test:state` covers 100% of the lines of the state files; CI runs it on the `state` branch
- Cost, measured: the built JavaScript is 102.6 kB gzip, up from 84.2 kB in 7.0.0 (Zustand, Redux Toolkit for the slice and selectors, TanStack Query)

## 7.0.0 — the shop in TypeScript

- Every source file in `web/src` is TypeScript: `npm run typecheck` reports 0 errors with `strict` on (it started at 44)
- One `Product`, `Cart` and `CartAction` for the whole shop in `types.ts`; a wrong cart action is a type error
- Bugs found on the way: `NaN` from an action without stock, a header count that disagreed with the panel, a broken image from a misspelt field, `0pen00` from another app's `cart` key
- Storage keys share the `siraj-shop:` prefix, checked by a template type (saved carts under the old `cart` key are not read)
- Search: a failing server or an answer in the wrong shape shows "البحث غير متاح الآن" instead of crashing (`HttpError`, `DataError`, type guards)
- CSS Modules have real class types (`scripts/css-types.mjs` writes `.d.css.ts` files)
- ESLint lints `.ts` and `.tsx` with typescript-eslint (it needs the TypeScript 6 API; `tsc` 7 runs as `tsc7`)
- CI checks types on every push, before lint, tests and build — `vite build` alone does not

## 6.0.0 — the shop in React

- The shop is rebuilt in React 19 with Vite, in `web/`: cards drawn from data, small components, CSS Modules, a dark theme that is remembered
- The cart: every rule in one reducer, shared through context, kept after a reload
- Search asks the API once typing pauses and drops answers it no longer needs
- Product pages and a 404, each with its own title; after a link, focus moves to the new page's heading
- The cart panel is a native dialog: it takes the focus, keeps Tab inside and closes with Escape
- A reviews form whose errors are announced and focused
- `npm test` in `web/`: Vitest and Testing Library; CI lints, tests and builds `web/` on every push
- The shop server serves the built shop at `/shop/` (run `npm run build` in `web/` first)
- Sold-out cards dim only the photo, so their text passes AA contrast

## 5.0.0 — the shop for every customer

- Keyboard: the cart is a real button, the phone menu keeps Tab order, a skip link goes to the products
- Screen readers: landmarks and headings to jump between, names that tell the add buttons apart, described photos, stars said as a number
- The mini cart is a modal dialog that takes the focus and gives it back
- Newsletter: a visible label, a hint, and errors and thanks that are announced
- Colour: the rating and the dark-mode error pass AA contrast
- Time: the added-to-cart message stays long enough to read and waits while hovered
- Zoom: at 400% the header scrolls away instead of covering the page; every button is at least 44px
- Load more keeps the focus and says how many reviews arrived; search says how many products it found
- Language: English prices and reviews are marked, customer reviews are isolated so they never flip a line
- `npm test` now runs accessibility tests (axe, size, language, focus, zoom), in CI too

## 4.0.1

- README: start the API (`npm run api`) before the page; how to run the tests

## 4.0.0 — the shop talks to a real API

- Prices, stock and search come from the shop API (`npm run api`), not from the HTML
- The cart lives on the server: add with POST, a cookie per browser, a timeout and a check after it
- Search waits for a pause in typing (debounce) and cancels the answer it no longer needs
- Product answers are cached with ETag; reviews load five at a time with a cursor
- Receipt download as CSV; the server applies the same discount as the page
- Live stock badges with Server-Sent Events
- Reviews show their product, loaded with one GraphQL query
- Every request goes through js/api.js: one ApiError with a code, and a shape check
- `npm test`: the API layer is tested with MSW, no server needed

## 3.0.0 — the shop in modern JavaScript

- Cart: a class with private fields, quantities in a Map, iterable, saved as entries
- Totals with pure functions and reduce; member prices from a frozen catalog copy
- Stock check per product (Promise.allSettled) and before every add (async/await)
- A broken saved cart no longer stops the page: it starts empty with a warning
- One delegated click listener for every add button
- Added-to-cart message whose timer restarts on every click
- Mini cart that removes its key listener when it closes (no leak)
- Cart code split into an ES module; Vite for development and builds
- The header redraws itself through a Proxy

## 2.0.0 — responsive from 280px to 1920px
