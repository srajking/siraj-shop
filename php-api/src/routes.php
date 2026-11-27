<?php
declare(strict_types=1);
// src/routes.php — the shop's URL table, the same URLs as server.js. public/index.php and composer routes read it
return (new Shop\Router())
    ->add('/api/products', 'api/products.php')
    ->add('/api/products/{id:\d+}', 'api/products.php')
    ->add('/api/products/{product:\d+}/reviews', 'api/reviews.php')
    ->add('/api/reviews', 'api/review-list.php')
    ->add('/api/reviews/summary', 'api/review-summary.php')
    ->add('/api/cart', 'api/cart.php')
    ->add('/api/cart/items', 'api/cart-items.php')
    ->add('/api/cart/items/{id:\d+}', 'api/cart-item.php')
    ->add('/api/cart/receipt', 'api/cart-receipt.php')
    ->add('/api/orders', 'api/orders.php')
    ->add('/api/login', 'api/login.php')
    ->add('/api/me', 'api/me.php')
    ->add('/api/logout', 'api/logout.php');
