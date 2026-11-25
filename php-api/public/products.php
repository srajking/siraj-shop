<?php
declare(strict_types=1);
// products.php — the product list, the same markup as the Next home page (site/app/page.tsx):
//   <li><h3><a href="/products/ID">NAME</a></h3><p>PRICE IQD</p></li>
require __DIR__ . '/../src/shop.php';
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
<?php foreach (PRODUCTS as ['id' => $id, 'name' => $name, 'price' => $price]): ?>
    <li>
      <h3><a href="/products/<?= $id ?>"><?= $name ?></a></h3>
      <p><?= priceText($price) ?></p>
    </li>
<?php endforeach; ?>
  </ul>
</body>
</html>
