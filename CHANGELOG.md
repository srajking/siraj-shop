# Changelog

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
