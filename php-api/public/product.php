<?php
declare(strict_types=1);
// product.php — one product, written exactly like the Next site writes it:
//   "{name} — 19,000 IQD at Siraj Shop"  and  "19,000 IQD · 3 in stock"
// For now one product in variables; products.json comes in chapter 16.

require __DIR__ . '/../src/shop.php';

['name' => $name, 'price' => $price, 'stock' => $stock] = PRODUCTS[3];   // one product for now — ?id= in chapter 12

$priceText   = priceText($price);                         // 19,000 IQD — same as toLocaleString("en")
$shop        = SHOP;                                       // a constant can't go inside "…"
$description = "$name — $priceText at $shop";

echo <<<HTML
    <!doctype html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <title>$name · {$shop}</title>
      <meta name="description" content="$description">
    </head>
    <body>
      <h1>$name</h1>
      <p>$priceText · $stock in stock</p>

    HTML;
?>
<?php // the button words come from the Next site (AddToCart.tsx) ?>
<?php if ($stock > 0): ?>
  <button>Add to cart</button>
<?php else: ?>
  <button disabled>No more in stock</button>
<?php endif; ?>
</body>
</html>
