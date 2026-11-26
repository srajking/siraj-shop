# php-api — the shop API in PHP

The same API as `server/` (Node), written in PHP while reading «أساسيات PHP».

Run it:

```sh
cd php-api
composer install      # once: makes vendor/autoload.php (no packages to download)
php -S localhost:8000 -t public -c php.ini public/index.php   # public/index.php = the front controller
```

Only `public/` is reachable from the browser; this README and every other file stay on the server.

Errors are never shown in the page: `php.ini` writes them to `logs/php-error.log` (outside `public/`, not committed).

New reviews are saved in `data/reviews.json` (not committed); until the first one, the API reads Node's `server/data/reviews.json`.

Check the code without running it: `composer lint` (syntax, `strict_types`, `var_dump` left behind).

An uncaught error returns `500 {"error":"server error","requestId":"…"}`; the same id is in `logs/php-error.log` with the cause.

The URLs are the same as the Node API: point the Next site at it with `SHOP_API=http://localhost:8000/api`.

Reviews live behind `Shop\ReviewStore`; the file is `data/reviews.json`, or the one named in `SHOP_REVIEWS` (the check scripts use their own).
