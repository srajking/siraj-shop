<?php
declare(strict_types=1);
// public/index.php — the front controller: every request comes here first, and a table sends it on.
//   php -S localhost:8000 -t public -c php.ini public/index.php
// The URLs are the same as server.js (/api/products/3/reviews); each endpoint stays in its own file.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
if ($path !== '/' && is_file(__DIR__ . $path)) return false;        // a real file (the old .php URLs): php -S serves it

require __DIR__ . '/../vendor/autoload.php';
$router = (new Shop\Router())                                       // the URL table — the same URLs as server.js
    ->add('#^/api/products$#', 'api/products.php')
    ->add('#^/api/products/(\d+)$#', 'api/products.php', 'id')        // /api/products/3 → $_GET['id'] = '3'
    ->add('#^/api/products/(\d+)/reviews$#', 'api/reviews.php', 'product')
    ->add('#^/api/reviews$#', 'api/review-list.php')
    ->add('#^/api/reviews/summary$#', 'api/review-summary.php')
    ->add('#^/api/cart$#', 'api/cart.php')
    ->add('#^/api/cart/items$#', 'api/cart-items.php')
    ->add('#^/api/cart/items/(\d+)$#', 'api/cart-item.php', 'id')
    ->add('#^/api/cart/receipt$#', 'api/cart-receipt.php')
    ->add('#^/api/orders$#', 'api/orders.php')
    ->add('#^/api/login$#', 'api/login.php')
    ->add('#^/api/me$#', 'api/me.php')
    ->add('#^/api/logout$#', 'api/logout.php');
if ($route = $router->match($path)) {
    $_GET = $route['params'] + $_GET;
    require __DIR__ . '/' . $route['page'];
    exit;
}
if ($path === '/') exit("Siraj Shop API — PHP is running\n");
require __DIR__ . '/../src/shop.php';
sendJson(404, ['error' => 'no such endpoint', 'path' => $path]);    // like server.js
