<?php
declare(strict_types=1);
// api/review-list.php — GET /api/reviews?product=&limit=&page= | &after= : newest first, one page at a time (like server.js)
require __DIR__ . '/../../src/shop.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) {
    sendJson(405, ['error' => 'method not allowed', 'allow' => ['GET', 'HEAD']], ['Allow' => 'GET, HEAD']);
}
$limit = isset($_GET['limit']) ? filter_var($_GET['limit'], FILTER_VALIDATE_INT) : 10;
if (!is_int($limit) || $limit < 1 || $limit > 50) sendJson(400, ['error' => 'limit must be 1 to 50', 'limit' => $_GET['limit'] ?? null]);

$list = reviews();
usort($list, fn (array $a, array $b): int => $b['id'] <=> $a['id']);
if (($_GET['product'] ?? '') !== '') {
    $list = array_values(array_filter($list, fn (array $r): bool => $r['productId'] === (int) $_GET['product']));
}
$total = count($list);
$count = ['X-Total-Count' => (string) $total];

if (isset($_GET['page'])) {                                          // offset: skip (page - 1) * limit
    $page = filter_var($_GET['page'], FILTER_VALIDATE_INT);
    if (!is_int($page) || $page < 1) sendJson(400, ['error' => 'page starts at 1', 'page' => $_GET['page']], $count);
    sendJson(200, ['items' => array_slice($list, ($page - 1) * $limit, $limit), 'page' => $page, 'limit' => $limit, 'total' => $total, 'pages' => (int) ceil($total / $limit)], $count);
}
$start = 0;                                                          // cursor: continue after the last one you saw
if (($_GET['after'] ?? '') !== '') {
    $last = cursorId($_GET['after']);
    if ($last === null) sendJson(400, ['error' => 'bad cursor', 'after' => $_GET['after']], $count);
    $start = $total;
    foreach ($list as $i => $r) if ($r['id'] < $last) { $start = $i; break; }
}
$items = array_slice($list, $start, $limit);
sendJson(200, ['items' => $items, 'next' => $start + $limit < $total ? cursorOf(end($items)['id']) : null], $count);
