<?php
declare(strict_types=1);
// product.php — one product, written exactly like the Next site writes it:
//   "{name} — 19,000 IQD at Siraj Shop"  and  "19,000 IQD · 3 in stock"
// For now one product in variables; products.json comes in chapter 16.

const SHOP = 'Siraj Shop';

$name  = 'حقيبة ظهر';
$price = 19000;
$stock = 3;

$priceText   = number_format($price) . ' IQD';            // 19,000 IQD — same as toLocaleString("en")
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
    </body>
    </html>

    HTML;
