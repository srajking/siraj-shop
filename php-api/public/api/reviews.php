<?php
declare(strict_types=1);
// api/reviews.php?product=3 — like /api/products/3/reviews in server.js
//   GET  → the product's reviews        POST {name, stars, text} as JSON → 201 + the review
// Only JSON is accepted: a plain HTML form from another site cannot send it (415) — no CSRF through forms.
require __DIR__ . '/../../src/shop.php';

$id = filter_input(INPUT_GET, 'product', FILTER_VALIDATE_INT);
if (!is_int($id) || !isset(PRODUCTS[$id])) sendJson(404, ['error' => 'product not found', 'id' => $id]);

$mine = array_values(array_filter(reviews(), fn (array $r): bool => $r['productId'] === $id));
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') sendJson(200, $mine);
if ($method !== 'POST') sendJson(405, ['error' => 'method not allowed', 'allow' => ['GET', 'POST']], ['Allow' => 'GET, POST']);

$type = $_SERVER['CONTENT_TYPE'] ?? '';
if (!str_starts_with($type, 'application/json')) sendJson(415, ['error' => 'send JSON', 'got' => $type ?: null]);
try {
    $body = json_decode(file_get_contents('php://input'), true, flags: JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    sendJson(400, ['error' => 'body is not valid JSON', 'detail' => $e->getMessage()]);
}
if (!is_array($body)) sendJson(400, ['error' => 'body is not valid JSON', 'detail' => 'not an object']);
if ($error = reviewError($body)) sendJson(422, $error);

$review = ['id' => count(reviews()) + 1, 'productId' => $id, 'name' => trim($body['name']), 'stars' => $body['stars'], 'text' => trim($body['text'])];
sendJson(201, $review, ['Location' => "/api/products/$id/reviews/{$review['id']}"]);
