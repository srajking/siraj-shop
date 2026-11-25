<?php
declare(strict_types=1);
// bin/cart.php — the cart summary like cartView(): CART="3:2,2:3" php bin/cart.php
require __DIR__ . '/../src/shop.php';

['count' => $count, 'subtotal' => $subtotal, 'total' => $total] = cartSummary(parseCart((string) getenv('CART')));
echo "count=$count subtotal=$subtotal total=$total\n";
