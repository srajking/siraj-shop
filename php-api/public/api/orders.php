<?php
declare(strict_types=1);
// api/orders.php — /api/orders like server.js: POST (logged in) turns the cart into an order; GET (admins) lists them.
// Unlike Node, the orders are kept (data/orders.json) — so GET returns them instead of [].
require __DIR__ . '/../../src/shop.php';

$cart = cartId();
startSession();
$user = currentUser();
if ($user === null) sendJson(401, ['error' => 'login required'], ['WWW-Authenticate' => 'Bearer']);
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET' && $user['role'] !== 'admin') sendJson(403, ['error' => 'admins only', 'role' => $user['role']]);
if ($method === 'GET') sendJson(200, checkout()->orders());
if ($method !== 'POST') sendJson(405, ['error' => 'method not allowed', 'allow' => ['GET', 'POST']], ['Allow' => 'GET, POST']);
try {
    sendJson(201, checkout()->place($cart, $user['name']));            // an Order: jsonSerialize() gives the shape
} catch (Shop\CartProblem $e) {
    sendJson($e->status, $e->toArray());
}
