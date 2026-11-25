<?php
declare(strict_types=1);
// product.php — one product, written exactly like the Next site writes it:
//   "{name} — 19,000 IQD at Siraj Shop"  and  "19,000 IQD · 3 in stock"
// URL: /product.php?id=3  (the Next site: /products/3)

require __DIR__ . '/../src/shop.php';

// ?id= arrives as text: accept only a whole number from 1 — anything else is "not found"
$id      = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
$product = is_int($id) ? (PRODUCTS[$id] ?? null) : null;
if ($product === null) {
    http_response_code(404);                                 // like notFound() in Next — status codes: chapter 13
    echo "<!doctype html>\n<title>Not found · Siraj Shop</title>\n<h1>Not found</h1>\n";
    exit;
}
['name' => $name, 'price' => $price, 'stock' => $stock] = $product;

$priceText   = Shop\Price::text($price);                         // 19,000 IQD — same as toLocaleString("en")
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
