<?php
declare(strict_types=1);
// bin/cart.php — the cart summary, the same numbers as cartView() in server/server.js:
//   items (name, price, qty), count = all pieces, subtotal, total after the discount.
// run: CART="3:2,2:3" php bin/cart.php      (product id : quantity, comma between items)

const DISCOUNT_LIMIT = 10000;
const DISCOUNT_RATE  = 0.9;

const PRODUCTS = [
    1 => ['id' => 1, 'name' => 'دفتر A5',   'price' => 3000],
    2 => ['id' => 2, 'name' => 'قلم حبر',   'price' => 1000],
    3 => ['id' => 3, 'name' => 'حقيبة ظهر', 'price' => 19000],
];

/** "3:2,2:3" → [[id 3, qty 2], [id 2, qty 3]] with the product's name and price */
function parseCart(string $text): array
{
    $items = [];
    foreach (explode(',', $text) as $pair) {
        [$id, $qty] = array_map('intval', explode(':', $pair));
        $items[] = ['id' => $id, 'name' => PRODUCTS[$id]['name'], 'price' => PRODUCTS[$id]['price'], 'qty' => $qty];
    }
    return $items;
}

/** the shop's discount rule — the one place it is written */
function discountTotal(int $subtotal): int
{
    return $subtotal >= DISCOUNT_LIMIT ? (int) round($subtotal * DISCOUNT_RATE) : $subtotal;
}

/** the same keys as cartView(): count, subtotal, total */
function cartSummary(array $items): array
{
    $subtotal = array_sum(array_map(fn (array $i): int => $i['qty'] * $i['price'], $items));
    return [
        'count'    => array_sum(array_column($items, 'qty')),
        'subtotal' => $subtotal,
        'total'    => discountTotal($subtotal),
    ];
}

['count' => $count, 'subtotal' => $subtotal, 'total' => $total] = cartSummary(parseCart((string) getenv('CART')));
echo "count=$count subtotal=$subtotal total=$total\n";
