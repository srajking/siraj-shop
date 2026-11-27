<?php
declare(strict_types=1);
// bin/routes.php — print the URL table: which URL goes to which page
//   composer routes
require __DIR__ . '/../vendor/autoload.php';
echo implode("\n", (require __DIR__ . '/../src/routes.php')->list()), "\n";
