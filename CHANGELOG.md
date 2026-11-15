# Changelog

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
