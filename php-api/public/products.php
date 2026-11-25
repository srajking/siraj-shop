<?php
declare(strict_types=1);
// products.php — the product list, the same markup as the Next home page (site/app/page.tsx):
//   <li><h3><a href="/products/ID">NAME</a></h3><p>PRICE IQD</p></li>
// Options like GET /api/products: ?sort=price|-price|name  ?q=part of the name  ?category=stationery|bags
require __DIR__ . '/../src/shop.php';

$sort     = filter_input(INPUT_GET, 'sort') ?: null;              // null when missing or empty
$q        = trim((string) filter_input(INPUT_GET, 'q'));
$category = filter_input(INPUT_GET, 'category') ?: null;

if ($sort !== null && !isset(productSorts()[$sort])) {           // like server.js: 400 + the allowed list
    http_response_code(400);
    echo 'unknown sort: ', htmlspecialchars($sort),   // never print raw input: chapter 14
         ' (allowed: ', implode(', ', array_keys(productSorts())), ")\n";
    exit;
}
$products = productList($sort, $q, $category);
?>
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>Products · Siraj Shop</title>
</head>
<body>
  <h1>Products</h1>
  <ul class="grid">
<?php foreach ($products as ['id' => $id, 'name' => $name, 'price' => $price]): ?>
    <li>
      <h3><a href="/products/<?= $id ?>"><?= $name ?></a></h3>
      <p><?= Shop\Price::text($price) ?></p>
    </li>
<?php endforeach; ?>
  </ul>
</body>
</html>
