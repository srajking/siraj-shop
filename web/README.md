# Siraj Shop — React

The shop rebuilt in React 19 with Vite.

## Work on it

```sh
npm run api      # in the repo root: the shop API on http://localhost:4000
npm install      # in web/
npm run dev      # in web/: http://localhost:5180 — /api goes to the API through the Vite proxy
```

## Check it

```sh
npm run lint     # ESLint, with the React hooks rules
npm test         # Vitest + Testing Library
npm run build    # writes web/dist
```

CI runs all three on every push (`.github/workflows/check.yml`, job `web`).

## Serve the built shop

```sh
npm run build    # in web/ — files for /shop/
npm run api      # in the repo root → http://localhost:4000/shop/
```
