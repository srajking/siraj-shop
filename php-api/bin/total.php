<?php
declare(strict_types=1);
// bin/total.php — the cart total for one subtotal: SUBTOTAL=19000 php bin/total.php
require __DIR__ . '/../src/shop.php';

echo discountTotal((int) getenv('SUBTOTAL')), PHP_EOL;
