<?php
declare(strict_types=1);
// bin/total.php — the cart total for one subtotal: SUBTOTAL=19000 php bin/total.php
require __DIR__ . '/../src/shop.php';

echo Shop\Price::discounted((int) getenv('SUBTOTAL')), PHP_EOL;
