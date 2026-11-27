<?php
declare(strict_types=1);
// api/reviews.php?product=3 — like /api/products/3/reviews in server.js
//   GET  → the product's reviews        POST {name, stars, text} as JSON → 201 + the review
// Only JSON is accepted: a plain HTML form from another site cannot send it (415) — no CSRF through forms.
require __DIR__ . '/../../src/shop.php';

$id = filter_var($_GET['product'] ?? null, FILTER_VALIDATE_INT);   // $_GET, not filter_input: the front controller sets it
if (!is_int($id) || catalog()->find($id) === null) sendJson(404, ['error' => 'product not found', 'id' => $id]);

$mine = array_values(array_filter(reviews(), fn (array $r): bool => $r['productId'] === $id));
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') sendJson(200, $mine);
if ($method !== 'POST') sendJson(405, ['error' => 'method not allowed', 'allow' => ['GET', 'POST']], ['Allow' => 'GET, POST']);

$body = jsonBody();                                                  // 415 / 400: one place, src/shop.php
if (!is_array($body)) sendJson(400, ['error' => 'body is not valid JSON', 'detail' => 'not an object']);
try {
    $clean = reviewFrom($body);
} catch (Shop\InvalidReview $e) {                                    // the customer's mistake: answer it, don't log it
    sendJson(422, $e->toArray());
}

$review = addReview(['productId' => $id] + $clean);
sendJson(201, $review, ['Location' => "/api/products/$id/reviews/{$review['id']}"]);
