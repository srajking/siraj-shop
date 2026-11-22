# Where the shop keeps its state

Ask, for every new piece of state: comes from the server? shared by a link? how many components read it? changes often? must survive a reload?

| State | Lives in | Why there | Readers |
|---|---|---|---|
| Cart `{ productId: qty }` | `cartStore.ts` — Zustand + persist (`siraj-shop:cart`), rules in `cartSlice.ts` | shared by far-apart components, changes on every click, survives reload; old saves still load | Header, CartPanel, ProductCard (each selects its piece) |
| Dark theme | `components/ThemeToggle.tsx` — `useLocalStorage` (`siraj-shop:dark`) | one reader, survives reload | the button itself |
| Search text `?q=` | `components/SearchBox.tsx` — URL via `useSearchParams` | shareable by link, Back works (`replace` while typing) | SearchBox |
| Review form fields | `components/ReviewForm.tsx` — `useState` | only the form reads them; typing must not redraw the list | ReviewForm |
| A product's reviews | server, cached by TanStack Query `['reviews', productId]` in `components/Reviews.tsx` | other customers write them; added optimistically, rolled back if refused | Reviews (on the product page) |

Server answers (TanStack Query, `queryClient.ts`): search results `['search', q]`, reviews `['reviews', id]`.

Derived, never stored: cart count and total (`selectCount`, `selectTotal`), review errors (`validate(form)`), search results shown.

Check: `npm run state-map` prints how many state owners this file documents.
