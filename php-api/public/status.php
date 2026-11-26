<?php
declare(strict_types=1);
// status.php — the team opens it to check the API is alive.
// Only public facts here: no paths, no settings.

require __DIR__ . '/../vendor/autoload.php';
const SHOP = 'Siraj Shop API';
const API_VERSION = Shop\Release::VERSION;   // one place: src/Release.php (and CHANGELOG.md)
?>
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title><?= SHOP ?> — status</title>
</head>
<body>
  <h1><?= SHOP ?></h1>
  <p>API <?= API_VERSION ?> · PHP <?= PHP_VERSION ?></p>
  <p>Server time: <?= date('Y-m-d H:i') ?> (<?= date_default_timezone_get() ?>)</p>
</body>
</html>
