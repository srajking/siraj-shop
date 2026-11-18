# Changelog

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
