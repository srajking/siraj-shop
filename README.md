# Siraj Shop

A small shop page for the Git, responsive design and advanced JavaScript books.

## Run it

The shop uses ES modules, so it must be served over http — opening `index.html` by double-click
is blocked by the browser (CORS on `file://`).

    npm install
    npm run api       # the shop API on http://localhost:4000 — keep it running
    npm run dev       # in a second terminal: the page on http://localhost:5173 (/api goes to the API)
    npm test          # tests for the API layer (no server needed)
    npm run build     # production files in dist/
    npm run preview   # serve dist/ locally (needs the API too)

Delivery to Baghdad and Basra.

Live site: https://srajking.github.io/siraj-shop/
