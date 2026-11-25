<?php
declare(strict_types=1);
// bin/products.php — the list like GET /api/products: SORT=price|-price|name Q=… CATEGORY=…
require __DIR__ . '/../src/shop.php';

$sort = getenv('SORT') ?: null;
if ($sort !== null && !isset(productSorts()[$sort])) {
    echo "unknown sort: $sort (allowed: ", implode(', ', array_keys(productSorts())), ")\n";
    exit(1);
}
foreach (productList($sort, trim((string) getenv('Q')), getenv('CATEGORY') ?: null) as ['id' => $id, 'name' => $name, 'price' => $price]) {
    echo "$id $name $price\n";
}
