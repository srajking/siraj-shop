<?php
declare(strict_types=1);
// api/cart-receipt.php — GET /api/cart/receipt: the cart as a CSV file, like server.js (a BOM so Excel reads UTF-8)
require __DIR__ . '/../../src/shop.php';

$view = cartView(cartRepository()->items(cartId()));
if ($view['count'] === 0) sendJson(409, ['error' => 'cart is empty']);
$rows = [['product', 'qty', 'price', 'line']];
foreach ($view['items'] as $i) $rows[] = [$i['name'], $i['qty'], $i['price'], $i['qty'] * $i['price']];
$rows[] = ['subtotal', $view['count'], '', $view['subtotal']];
$rows[] = ['total', '', '', $view['total']];
$csv = "\u{FEFF}" . implode("\r\n", array_map(fn (array $r): string => implode(',', $r), $rows)) . "\r\n";
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="siraj-receipt.csv"');
header('Content-Length: ' . strlen($csv));
echo $csv;
