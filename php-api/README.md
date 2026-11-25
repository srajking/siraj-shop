# php-api — the shop API in PHP

The same API as `server/` (Node), written in PHP while reading «أساسيات PHP».

Run it:

```sh
cd php-api
php -S localhost:8000 -t public -c php.ini
```

Only `public/` is reachable from the browser; this README and every other file stay on the server.

Errors are never shown in the page: `php.ini` writes them to `logs/php-error.log` (outside `public/`, not committed).

New reviews are saved in `data/reviews.json` (not committed); until the first one, the API reads Node's `server/data/reviews.json`.
