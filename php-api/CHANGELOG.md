# Changelog — php-api

The API version is in `src/Release.php`; `/status.php` shows it. Versions follow MAJOR.MINOR.PATCH:
a change that can break a client is MAJOR, a new feature is MINOR, a fix is PATCH.

## 11.0.0 — the shop as objects («PHP كائني التوجه»)

MAJOR because a wrong cart text, a wrong review field type and a foreign cart cookie are now refused
where they used to pass (see "Changed").

### Added
- `/api/cart`, `/api/cart/items`, `/api/cart/items/:id`, `/api/cart/receipt` — like server.js (CartService, CartRepository).
- `/api/orders` — POST turns the cart into an Order (logged in); GET lists them (admins). The orders are kept in `data/orders.json`.
- `/api/reviews/summary` — count and average stars, like server.js (ReviewList).
- `composer test` — unit tests in `tests/`, no server needed.
- `Shop\Router` — the URL table of the front controller.

### Changed
- Products: `Shop\Product` (readonly, checked once), `Category` enum, `Catalog` reads the file on first use.
- A cart text like `3:-2`, `9:1` or `3:x` is a data error (exit 2), and the same product is one line (Cart, CartLine).
- A review with a field of the wrong type is `422` with the field, not `500` (InvalidReview).
- `?product=3abc` on the reviews matches nothing, like `Number()` in server.js.
- A visit without a cart cookie writes no file; a cookie that is not one of our ids is replaced.
- Product names are escaped on the HTML pages (SafeView); the API sends them as they are.

### Fixed
- A broken products or reviews file is a data error that names the file (ReadsJson).
- Login, `/api/me` and the review list answer even when `products.json` is broken.
- The shop's own checks no longer touch the real reviews (`SHOP_REVIEWS`).
- `/status.php` showed `API 0.3.0`; it now reads the version from `src/Release.php`.
