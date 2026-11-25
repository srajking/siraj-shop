<?php
declare(strict_types=1);
// src/shop.php — the shop's data and rules, written once. Every page and tool requires it:
//   require __DIR__ . '/../src/shop.php';
// It is outside public/, so no one can request it from the browser.

const SHOP           = 'Siraj Shop';
const DISCOUNT_LIMIT = 10000;   // server.js: DISCOUNT.LIMIT
const DISCOUNT_RATE  = 0.9;     // server.js: DISCOUNT.RATE

// the same fields as server/data/products.json, keyed by id (reading the file: chapter 16)
const PRODUCTS = [
    1 => ['id' => 1, 'name' => 'دفتر A5',   'price' => 3000,  'stock' => 12, 'category' => 'stationery'],
    2 => ['id' => 2, 'name' => 'قلم حبر',   'price' => 1000,  'stock' => 40, 'category' => 'stationery'],
    3 => ['id' => 3, 'name' => 'حقيبة ظهر', 'price' => 19000, 'stock' => 3,  'category' => 'bags'],
];

/** 19000 → "19,000 IQD" — like toLocaleString("en") on the Next site */
function priceText(int $price): string
{
    return number_format($price) . ' IQD';
}

/** the discount rule — 10% off from 10,000 IQD, rounded to a whole dinar */
function discountTotal(int $subtotal): int
{
    return $subtotal >= DISCOUNT_LIMIT ? (int) round($subtotal * DISCOUNT_RATE) : $subtotal;
}

/** "3:2,2:3" → items with id, name, price, qty */
function parseCart(string $text): array
{
    $items = [];
    foreach (explode(',', $text) as $pair) {
        [$id, $qty] = array_map('intval', explode(':', $pair));
        $items[] = ['id' => $id, 'name' => PRODUCTS[$id]['name'], 'price' => PRODUCTS[$id]['price'], 'qty' => $qty];
    }
    return $items;
}

/** the same keys as cartView() in server.js: count, subtotal, total */
function cartSummary(array $items): array
{
    $subtotal = array_sum(array_map(fn (array $i): int => $i['qty'] * $i['price'], $items));
    return [
        'count'    => array_sum(array_column($items, 'qty')),
        'subtotal' => $subtotal,
        'total'    => discountTotal($subtotal),
    ];
}

/** one comparison function per sort name — like SORTS in server.js */
function productSorts(): array
{
    return [
        'price'  => fn (array $a, array $b): int => $a['price'] <=> $b['price'],
        '-price' => fn (array $a, array $b): int => $b['price'] <=> $a['price'],
        'name'   => fn (array $a, array $b): int => strcmp($a['name'], $b['name']),
    ];
}

/** the product list with GET /api/products options; the sort name must be a key of productSorts() */
function productList(?string $sort = null, string $q = '', ?string $category = null): array
{
    $list = array_values(PRODUCTS);
    if ($q !== '')          $list = array_filter($list, fn (array $p): bool => str_contains($p['name'], $q));
    if ($category !== null) $list = array_filter($list, fn (array $p): bool => $p['category'] === $category);
    if ($sort !== null)     usort($list, productSorts()[$sort]);
    return array_values($list);
}

/** send JSON like send() in server.js and stop: status, Content-Type, the body as JSON.stringify writes it */
function sendJson(int $status, mixed $data, array $headers = []): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    foreach ($headers as $name => $value) header("$name: $value");
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}

/** like cached() in server.js: an ETag from the body, Cache-Control, and 304 when the browser has it already */
function sendCached(mixed $data, array $headers = []): never
{
    $body = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    $etag = '"' . substr(rtrim(strtr(base64_encode(sha1($body, true)), '+/', '-_'), '='), 0, 16) . '"';
    $headers += ['ETag' => $etag, 'Cache-Control' => 'max-age=30'];
    if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) {
        http_response_code(304);
        foreach ($headers as $name => $value) header("$name: $value");
        exit;
    }
    sendJson(200, $data, $headers);
}
