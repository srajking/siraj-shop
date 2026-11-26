<?php
declare(strict_types=1);
// api/review-summary.php — GET /api/reviews/summary?product= : how many reviews and their average stars (like server.js)
require __DIR__ . '/../../src/shop.php';

$list = (new Shop\ReviewList(reviews()))->forProduct((string) ($_GET['product'] ?? ''));
sendJson(200, ['count' => count($list), 'avg' => $list->averageStars()]);
