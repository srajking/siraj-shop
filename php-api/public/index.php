<?php
declare(strict_types=1);
// public/index.php — the front controller: every request comes here first, and a table sends it on.
//   php -S localhost:8000 -t public -c php.ini public/index.php
// The URLs are the same as server.js (/api/products/3/reviews); each endpoint stays in its own file.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
if ($path !== '/' && is_file(__DIR__ . $path)) return false;        // a real file (the old .php URLs): php -S serves it

const ROUTES = [                                                     // pattern => [file, name of the number in the path]
    '#^/api/products$#'               => ['api/products.php'],
    '#^/api/products/(\d+)$#'         => ['api/products.php', 'id'],
    '#^/api/products/(\d+)/reviews$#' => ['api/reviews.php', 'product'],
    '#^/api/reviews$#'                => ['api/review-list.php'],
    '#^/api/login$#'                  => ['api/login.php'],
    '#^/api/me$#'                     => ['api/me.php'],
    '#^/api/logout$#'                 => ['api/logout.php'],
];
foreach (ROUTES as $pattern => $route) {
    if (preg_match($pattern, $path, $m)) {
        if (isset($route[1])) $_GET[$route[1]] = $m[1];             // /api/products/3 → $_GET['id'] = '3'
        require __DIR__ . '/' . $route[0];
        exit;
    }
}
if ($path === '/') exit("Siraj Shop API — PHP is running\n");
require __DIR__ . '/../src/shop.php';
sendJson(404, ['error' => 'no such endpoint', 'path' => $path]);    // like server.js
