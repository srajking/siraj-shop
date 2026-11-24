<?php
declare(strict_types=1);
// bin/total.php — the cart total, the same rule as server.js and js/cart.js:
//   10% off when the subtotal reaches 10,000 IQD, rounded to a whole dinar.
// run: SUBTOTAL=19000 php bin/total.php

const DISCOUNT_LIMIT = 10000;   // server.js: DISCOUNT.LIMIT
const DISCOUNT_RATE  = 0.9;     // server.js: DISCOUNT.RATE

$subtotal = (int) getenv('SUBTOTAL');
if ($subtotal >= DISCOUNT_LIMIT) {
    $total = (int) round($subtotal * DISCOUNT_RATE);         // round() gives float; the API sends int
} else {
    $total = $subtotal;
}

echo $total, PHP_EOL;
