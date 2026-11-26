<?php
declare(strict_types=1);
// api/cart-items.php — POST /api/cart/items {id, qty}: add to this browser's cart, like server.js (no Idempotency-Key yet)
// HTTP only: the rules are in CartService
require __DIR__ . '/../../src/shop.php';

$id = cartId();
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') sendNoContent(['Allow' => 'POST, OPTIONS']);
if ($method !== 'POST') sendJson(405, ['error' => 'method not allowed', 'allow' => ['POST', 'OPTIONS']], ['Allow' => 'POST, OPTIONS']);

$body = jsonBody();
try {
    $line = cartService()->add($id, $body['id'] ?? null, $body['qty'] ?? 1);
} catch (Shop\CartProblem $e) {
    sendJson($e->status, $e->toArray());
}
sendJson(201, $line, ['Location' => "/api/cart/items/{$line['id']}"]);
