<?php
declare(strict_types=1);
// api/cart-item.php — /api/cart/items/:id: GET, PUT, PATCH, DELETE one line of this browser's cart, like server.js
require __DIR__ . '/../../src/shop.php';

$cart = cartId();
$id = (int) $_GET['id'];
$method = $_SERVER['REQUEST_METHOD'];
$allow = ['GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
if ($method === 'OPTIONS') sendNoContent(['Allow' => implode(', ', $allow)]);
if (!in_array($method, $allow, true)) sendJson(405, ['error' => 'method not allowed', 'allow' => $allow], ['Allow' => implode(', ', $allow)]);
try {
    $line = cartService()->item($cart, $id);                         // not in the cart: 404 before anything else
    if ($method === 'GET') sendJson(200, $line);
    if ($method === 'DELETE') {
        cartService()->remove($cart, $id);
        sendNoContent();
    }
    $body = jsonBody();
    sendJson(200, $method === 'PUT' ? cartService()->replace($cart, $id, $body) : cartService()->patch($cart, $id, $body));
} catch (Shop\CartProblem $e) {
    sendJson($e->status, $e->toArray());
}
