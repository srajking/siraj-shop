<?php
declare(strict_types=1);
// api/cart-items.php — POST /api/cart/items {id, qty}: add to this browser's cart, like server.js (no Idempotency-Key yet)
require __DIR__ . '/../../src/shop.php';

$id = cartId();
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') sendNoContent(['Allow' => 'POST, OPTIONS']);
if ($method !== 'POST') sendJson(405, ['error' => 'method not allowed', 'allow' => ['POST', 'OPTIONS']], ['Allow' => 'POST, OPTIONS']);

$type = $_SERVER['CONTENT_TYPE'] ?? '';
if (!str_starts_with($type, 'application/json')) sendJson(415, ['error' => 'send JSON', 'got' => $type ?: null]);
try {
    $body = json_decode(file_get_contents('php://input'), true, flags: JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    sendJson(400, ['error' => 'body is not valid JSON', 'detail' => $e->getMessage()]);
}
$product = is_int($body['id'] ?? null) ? catalog()->find($body['id']) : null;
if ($product === null) sendJson(404, ['error' => 'product not found', 'id' => $body['id'] ?? null]);
$qty = $body['qty'] ?? 1;
if (!is_int($qty) || $qty < 1) sendJson(422, ['error' => 'qty must be a whole number from 1', 'qty' => $qty]);

$items = cartRepository()->items($id);
$now = ($items[$product['id']]['qty'] ?? 0) + $qty;
if ($now > $product['stock']) sendJson(409, ['error' => 'not enough stock', 'stock' => $product['stock'], 'wanted' => $now]);
$items[$product['id']] = ['id' => $product['id'], 'qty' => $now, 'note' => $items[$product['id']]['note'] ?? ''];
cartRepository()->save($id, $items);
sendJson(201, $items[$product['id']], ['Location' => "/api/cart/items/{$product['id']}"]);
