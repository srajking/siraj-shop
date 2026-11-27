<?php
declare(strict_types=1);
// bin/answers.php — ask the PHP shop a fixed list of questions and print each answer's status, type and body fingerprint
//   composer answers                 (starts its own server on :8090, stops it at the end)
//   composer answers > before.txt    … change the code …    composer answers | diff before.txt -
$requests = [
    ['GET', '/api/products'], ['GET', '/api/products?sort=price'], ['GET', '/api/products?sort=bad'],
    ['GET', '/api/products?q=%D8%AF%D9%81%D8%AA%D8%B1'], ['GET', '/api/products/3'], ['GET', '/api/products/99'],
    ['POST', '/api/products'], ['GET', '/api/products/3/reviews'], ['GET', '/api/reviews'], ['GET', '/api/reviews/summary'],
    ['GET', '/api/cart'], ['OPTIONS', '/api/cart'], ['PUT', '/api/cart'], ['GET', '/api/cart/items/1'],
    ['GET', '/api/me'], ['GET', '/api/orders'], ['GET', '/api/login'],
    ['POST', '/api/login', 'text/plain', 'hi'], ['POST', '/api/login', 'application/json', '{"username":"x","password":"y"}'],
    ['POST', '/api/login', 'application/json', '{bad'], ['POST', '/api/cart/items', 'application/json', '{bad'],
    ['GET', '/nowhere'], ['GET', '/product.php?id=3'], ['GET', '/product.php?id=abc'], ['GET', '/products.php?sort=name'],
];
$port = 8090;
$server = proc_open([PHP_BINARY, '-S', "localhost:$port", '-t', 'public', '-c', 'php.ini', 'public/index.php'], [1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes, __DIR__ . '/..');
usleep(400_000);
$all = '';
foreach ($requests as $r) {
    [$method, $path, $type, $body] = $r + [2 => null, 3 => null];
    $c = curl_init("http://localhost:$port$path");
    curl_setopt_array($c, [CURLOPT_CUSTOMREQUEST => $method, CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => $type ? ["Content-Type: $type"] : []]);
    if ($body !== null) curl_setopt($c, CURLOPT_POSTFIELDS, $body);
    $answer = (string) curl_exec($c);
    $line = sprintf("%-7s %-44s %d  %-31s %s", $method, $path, curl_getinfo($c, CURLINFO_RESPONSE_CODE), curl_getinfo($c, CURLINFO_CONTENT_TYPE) ?: '-', substr(md5($answer), 0, 8));
    echo $line, "\n";
    $all .= $line;
}
proc_terminate($server);
printf("%d answers · fingerprint %s\n", count($requests), substr(md5($all), 0, 12));
