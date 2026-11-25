<?php
declare(strict_types=1);
// bin/cart.php — the cart summary, the same numbers as cartView() in server/server.js:
//   items (name, price, qty), count = all pieces, subtotal, total after the discount.
// run: CART="3:2,2:3" php bin/cart.php      (product id : quantity, comma between items)

const DISCOUNT_LIMIT = 10000;
const DISCOUNT_RATE  = 0.9;

$products = [
    ['id' => 1, 'name' => 'دفتر A5',   'price' => 3000],
    ['id' => 2, 'name' => 'قلم حبر',   'price' => 1000],
    ['id' => 3, 'name' => 'حقيبة ظهر', 'price' => 19000],
];
$byId = array_column($products, null, 'id');            // [1 => [...], 2 => [...], 3 => [...]]

$items = [];
foreach (explode(',', (string) getenv('CART')) as $pair) {
    [$id, $qty] = array_map('intval', explode(':', $pair));
    $items[] = ['id' => $id, 'name' => $byId[$id]['name'], 'price' => $byId[$id]['price'], 'qty' => $qty];
}

$count    = array_sum(array_column($items, 'qty'));
$subtotal = array_sum(array_map(fn ($i) => $i['qty'] * $i['price'], $items));
$total    = $subtotal >= DISCOUNT_LIMIT ? (int) round($subtotal * DISCOUNT_RATE) : $subtotal;

echo "count=$count subtotal=$subtotal total=$total\n";
