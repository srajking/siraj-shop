<?php
declare(strict_types=1);
// api/cart.php — GET /api/cart (the cart) and DELETE /api/cart (empty it), like server.js
require __DIR__ . '/../../src/shop.php';

$id = cartId();
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET' || $method === 'HEAD') sendJson(200, cartView(cartRepository()->items($id)));
if ($method === 'DELETE') {
    cartRepository()->save($id, []);
    sendNoContent();
}
if ($method === 'OPTIONS') sendNoContent(['Allow' => 'GET, HEAD, DELETE, OPTIONS']);
sendJson(405, ['error' => 'method not allowed', 'allow' => ['GET', 'HEAD', 'DELETE', 'OPTIONS']], ['Allow' => 'GET, HEAD, DELETE, OPTIONS']);
