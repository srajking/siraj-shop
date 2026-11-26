<?php
declare(strict_types=1);
// bin/test.php — the shop's unit tests: every public test…() method of every tests/*Test.php, each on a new object
//   composer test        (no server, no Node, no real data)
require __DIR__ . '/../src/shop.php';

$pass = $fail = 0;
foreach (glob(__DIR__ . '/../tests/*Test.php') as $file) {
    $class = 'Shop\\Tests\\' . basename($file, '.php');
    foreach (get_class_methods($class) as $method) {
        if (!str_starts_with($method, 'test')) continue;
        try {
            (new $class())->$method();                                 // a new object: no test sees another's state
            $pass++;
        } catch (Throwable $e) {
            $fail++;
            echo 'FAIL  ', basename($file, '.php'), "::$method — ", $e->getMessage(), "\n";
        }
    }
}
echo "tests: $pass passed, $fail failed\n";
exit($fail === 0 ? 0 : 1);
