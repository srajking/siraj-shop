<?php
declare(strict_types=1);
// products.php — the product list, the same markup as the Next home page (site/app/page.tsx):
//   <li><h3><a href="/products/ID">NAME</a></h3><p>PRICE IQD</p></li>
// One record per product, the same fields as server/data/products.json
// (copied by hand for now — reading the file is chapter 16).

$products = [
    ['id' => 1, 'name' => 'دفتر A5',   'price' => 3000,  'stock' => 12, 'category' => 'stationery'],
    ['id' => 2, 'name' => 'قلم حبر',   'price' => 1000,  'stock' => 40, 'category' => 'stationery'],
    ['id' => 3, 'name' => 'حقيبة ظهر', 'price' => 19000, 'stock' => 3,  'category' => 'bags'],
];
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
      <p><?= number_format($price) ?> IQD</p>
    </li>
<?php endforeach; ?>
  </ul>
</body>
</html>
