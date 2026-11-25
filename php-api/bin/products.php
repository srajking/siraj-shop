<?php
declare(strict_types=1);
// bin/products.php — the product list with the same options as GET /api/products in server.js:
//   SORT=price|-price|name   Q=part of the name   CATEGORY=stationery|bags
// prints one line per product: id name price

const PRODUCTS = [
    ['id' => 1, 'name' => 'دفتر A5',   'price' => 3000,  'stock' => 12, 'category' => 'stationery'],
    ['id' => 2, 'name' => 'قلم حبر',   'price' => 1000,  'stock' => 40, 'category' => 'stationery'],
    ['id' => 3, 'name' => 'حقيبة ظهر', 'price' => 19000, 'stock' => 3,  'category' => 'bags'],
];

// one comparison function per sort name — like SORTS in server.js
$sorts = [
    'price'  => fn (array $a, array $b): int => $a['price'] <=> $b['price'],
    '-price' => fn (array $a, array $b): int => $b['price'] <=> $a['price'],
    'name'   => fn (array $a, array $b): int => strcmp($a['name'], $b['name']),   // UTF-8 bytes = Arabic letter order here
];

$sort     = getenv('SORT') ?: null;
$q        = trim((string) getenv('Q'));
$category = getenv('CATEGORY') ?: null;

if ($sort !== null && !isset($sorts[$sort])) {
    echo "unknown sort: $sort (allowed: ", implode(', ', array_keys($sorts)), ")\n";
    exit(1);
}

$list = PRODUCTS;
if ($q !== '')         $list = array_filter($list, fn (array $p): bool => str_contains($p['name'], $q));
if ($category !== null) $list = array_filter($list, fn (array $p): bool => $p['category'] === $category);
if ($sort !== null)     usort($list, $sorts[$sort]);

foreach ($list as ['id' => $id, 'name' => $name, 'price' => $price]) {
    echo "$id $name $price\n";
}
