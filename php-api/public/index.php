<?php
declare(strict_types=1);
// public/index.php — the front controller: every request comes here first, and a table sends it on.
//   php -S localhost:8000 -t public -c php.ini public/index.php
// The URLs are the same as server.js (/api/products/3/reviews); each endpoint stays in its own file.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
if ($path !== '/' && is_file(__DIR__ . $path)) return false;        // a real file (the old .php URLs): php -S serves it

require __DIR__ . '/../vendor/autoload.php';
$router = require __DIR__ . '/../src/routes.php';                    // the URL table: /api/products/{id:\d+} → api/products.php
if ($route = $router->match($path)) {
    $_GET = $route['params'] + $_GET;
    require __DIR__ . '/' . $route['page'];
    exit;
}
if ($path === '/') exit("Siraj Shop API — PHP is running\n");
require __DIR__ . '/../src/shop.php';
sendJson(404, ['error' => 'no such endpoint', 'path' => $path]);    // like server.js
