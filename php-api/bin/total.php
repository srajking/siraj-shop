<?php
declare(strict_types=1);
// bin/total.php — the cart total, the same rule as server.js and js/cart.js:
//   10% off when the subtotal reaches 10,000 IQD, rounded to a whole dinar.
// run: SUBTOTAL=19000 php bin/total.php

const DISCOUNT_LIMIT = 10000;   // server.js: DISCOUNT.LIMIT
const DISCOUNT_RATE  = 0.9;     // server.js: DISCOUNT.RATE

$subtotal = (int) getenv('SUBTOTAL');
$reached  = $subtotal >= DISCOUNT_LIMIT;                     // true / false
$rate     = 1 - (1 - DISCOUNT_RATE) * (int) $reached;      // true → 0.9, false → 1 (a clearer way: chapter 6)
$total    = (int) round($subtotal * $rate);                   // round() gives float; the API sends int

echo $total, PHP_EOL;
