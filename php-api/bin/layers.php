<?php
declare(strict_types=1);
// bin/layers.php — which of the three jobs does each page do? (the MVC book, chapter 1)
//   composer layers
//   request: reads the request or writes the answer itself   data: reaches the data and its rules   html: writes markup
$jobs = [
    'request' => '/REQUEST_METHOD|filter_input|\$_GET|\$_POST|http_response_code|sendJson|sendCached|sendNoContent|header\(/',
    'data'    => '/catalog\(|cartService\(|cartRepository\(|cartView\(|checkout\(|reviews\(|reviewStore\(|addReview\(|currentUser\(|productList\(|\$_SESSION|startSession\(/',
    'html'    => '/<!doctype|<h1|<p>|<li|<button|<title|<<<HTML/i',
];
$files = array_merge(glob('public/*.php'), glob('public/api/*.php'));
$count = [0, 0, 0, 0];
printf("%-30s %-8s %-5s %s\n", 'page', 'request', 'data', 'html');
foreach ($files as $file) {
    $source = file_get_contents($file);
    $has = array_map(fn ($re) => preg_match($re, $source) === 1, $jobs);
    $n = count(array_filter($has));
    $count[$n]++;
    printf("%-30s %-8s %-5s %s\n", $file, $has['request'] ? 'x' : '.', $has['data'] ? 'x' : '.', $has['html'] ? 'x' : '.');
}
printf("%d pages · all 3 jobs: %d · 2 jobs: %d · 1 job: %d\n", count($files), $count[3], $count[2], $count[1]);
