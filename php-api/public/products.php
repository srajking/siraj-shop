<?php
declare(strict_types=1);
// products.php — the product list, the same markup as the Next home page (site/app/page.tsx):
//   <li><h3><a href="/products/ID">NAME</a></h3><p>PRICE IQD</p></li>
// The lists come from server/data/products.json by hand for now — reading the file is chapter 16.

$names  = [1 => 'دفتر A5', 2 => 'قلم حبر', 3 => 'حقيبة ظهر'];
$prices = [1 => 3000,      2 => 1000,      3 => 19000];
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
<?php foreach ($names as $id => $name): ?>
    <li>
      <h3><a href="/products/<?= $id ?>"><?= $name ?></a></h3>
      <p><?= number_format($prices[$id]) ?> IQD</p>
    </li>
<?php endforeach; ?>
  </ul>
</body>
</html>
