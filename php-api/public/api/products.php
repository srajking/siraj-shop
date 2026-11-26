<?php
declare(strict_types=1);
// api/products.php — the same answers as GET /api/products and /api/products/:id in server.js
//   /api/products.php?sort=price&q=…&category=…     /api/products.php?id=3
require __DIR__ . '/../../src/shop.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) {
    sendJson(405, ['error' => 'method not allowed', 'allow' => ['GET', 'HEAD']], ['Allow' => 'GET, HEAD']);
}

if (isset($_GET['id'])) {                                       // one product
    $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
    $product = is_int($id) ? catalog()->find($id) : null;
    $product === null
        ? sendJson(404, ['error' => 'product not found', 'id' => (string) $_GET['id']])
        : sendCached($product);
}

$sort = filter_input(INPUT_GET, 'sort') ?: null;               // the list
if ($sort !== null && !isset(productSorts()[$sort])) {
    sendJson(400, ['error' => 'unknown sort', 'sort' => $sort, 'allowed' => array_keys(productSorts())]);
}
$list = productList($sort, trim((string) filter_input(INPUT_GET, 'q')), filter_input(INPUT_GET, 'category') ?: null);
sendCached($list, ['X-Total-Count' => (string) count($list)]);
