<?php
declare(strict_types=1);
// src/shop.php — the shop's data and rules, written once. Every page and tool requires it:
//   require __DIR__ . '/../src/shop.php';
// It is outside public/, so no one can request it from the browser.

const SHOP           = 'Siraj Shop';
const DISCOUNT_LIMIT = 10000;   // server.js: DISCOUNT.LIMIT
const DISCOUNT_RATE  = 0.9;     // server.js: DISCOUNT.RATE

require __DIR__ . '/../vendor/autoload.php';            // composer: Shop\StoreError → src/StoreError.php

// any exception nobody caught: the details go to the log, the customer gets short JSON with an id to quote
set_exception_handler(function (Throwable $e): void {
    $id = bin2hex(random_bytes(4));
    $cause = $e->getPrevious() ?? $e;
    error_log(json_encode([
        'requestId' => $id,
        'request'   => ($_SERVER['REQUEST_METHOD'] ?? 'CLI') . ' ' . ($_SERVER['REQUEST_URI'] ?? implode(' ', $_SERVER['argv'] ?? [])),
        'error'     => $e::class . ': ' . $e->getMessage(),
        'cause'     => $cause::class . ': ' . $cause->getMessage(),
        'at'        => $cause->getFile() . ':' . $cause->getLine(),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    if (PHP_SAPI === 'cli') {
        fwrite(STDERR, "error $id — see the log\n");
        exit(1);
    }
    sendJson(500, ['error' => 'server error', 'requestId' => $id]);
});

// the products come from the same file Node reads — one list for both servers, keyed by id
define('PRODUCTS', array_column(
    json_decode(file_get_contents(__DIR__ . '/../../server/data/products.json'), true, flags: JSON_THROW_ON_ERROR), null, 'id'));

const REVIEWS_FILE = __DIR__ . '/../data/reviews.json';   // the PHP shop's reviews (not committed)

/** 19000 → "19,000 IQD" — like toLocaleString("en") on the Next site */
function priceText(int $price): string
{
    return number_format($price) . ' IQD';
}

/** the discount rule — 10% off from 10,000 IQD, rounded to a whole dinar */
function discountTotal(int $subtotal): int
{
    return $subtotal >= DISCOUNT_LIMIT ? (int) round($subtotal * DISCOUNT_RATE) : $subtotal;
}

/** "3:2,2:3" → items with id, name, price, qty */
function parseCart(string $text): array
{
    $items = [];
    foreach (explode(',', $text) as $pair) {
        [$id, $qty] = array_map('intval', explode(':', $pair));
        $items[] = ['id' => $id, 'name' => PRODUCTS[$id]['name'], 'price' => PRODUCTS[$id]['price'], 'qty' => $qty];
    }
    return $items;
}

/** the same keys as cartView() in server.js: count, subtotal, total */
function cartSummary(array $items): array
{
    $subtotal = array_sum(array_map(fn (array $i): int => $i['qty'] * $i['price'], $items));
    return [
        'count'    => array_sum(array_column($items, 'qty')),
        'subtotal' => $subtotal,
        'total'    => discountTotal($subtotal),
    ];
}

/** one comparison function per sort name — like SORTS in server.js */
function productSorts(): array
{
    return [
        'price'  => fn (array $a, array $b): int => $a['price'] <=> $b['price'],
        '-price' => fn (array $a, array $b): int => $b['price'] <=> $a['price'],
        'name'   => fn (array $a, array $b): int => strcmp($a['name'], $b['name']),
    ];
}

/** the product list with GET /api/products options; the sort name must be a key of productSorts() */
function productList(?string $sort = null, string $q = '', ?string $category = null): array
{
    $list = array_values(PRODUCTS);
    if ($q !== '')          $list = array_filter($list, fn (array $p): bool => str_contains($p['name'], $q));
    if ($category !== null) $list = array_filter($list, fn (array $p): bool => $p['category'] === $category);
    if ($sort !== null)     usort($list, productSorts()[$sort]);
    return array_values($list);
}

/** send JSON like send() in server.js and stop: status, Content-Type, the body as JSON.stringify writes it */
function sendJson(int $status, mixed $data, array $headers = []): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    foreach ($headers as $name => $value) header("$name: $value");
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}

/** like cached() in server.js: an ETag from the body, Cache-Control, and 304 when the browser has it already */
function sendCached(mixed $data, array $headers = []): never
{
    $body = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    $etag = '"' . substr(rtrim(strtr(base64_encode(sha1($body, true)), '+/', '-_'), '='), 0, 16) . '"';
    $headers += ['ETag' => $etag, 'Cache-Control' => 'max-age=30'];
    if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) {
        http_response_code(304);
        foreach ($headers as $name => $value) header("$name: $value");
        exit;
    }
    sendJson(200, $data, $headers);
}

/** all reviews — before the first new one is saved, Node's seed file */
function reviews(): array
{
    $file = is_file(REVIEWS_FILE) ? REVIEWS_FILE : __DIR__ . '/../../server/data/reviews.json';
    try {
        return json_decode(file_get_contents($file), true, flags: JSON_THROW_ON_ERROR);
    } catch (JsonException $e) {
        throw new Shop\StoreError('the reviews file is broken', previous: $e);   // say what broke, keep the cause
    }
}

/** save a review and return it with its id: one request at a time (lock), and the file is replaced whole (rename) */
function addReview(array $review): array
{
    $lock = fopen(REVIEWS_FILE . '.lock', 'c');
    flock($lock, LOCK_EX);                                   // the next request waits here
    try {
        $all = reviews();
        $review = ['id' => count($all) + 1] + $review;       // the id rule of server.js
        $all[] = $review;
        $tmp = REVIEWS_FILE . '.' . getmypid() . '.tmp';
        file_put_contents($tmp, json_encode($all, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
        rename($tmp, REVIEWS_FILE);                          // readers see the old file or the new one, never half
        return $review;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

/** text → safe HTML: < > & " ' become entities — use it for every value printed into a page */
function e(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * The review rules, checked on the server. Returns null when the review is fine,
 * or the first error in the same shape as server.js: ['error' => …, field => what was sent].
 * server.js checks only the stars; the name and text rules are new here.
 */
function reviewError(array $body): ?array
{
    $stars = $body['stars'] ?? null;
    if (!is_int($stars) || $stars < 1 || $stars > 5) return ['error' => 'stars must be 1 to 5', 'stars' => $stars];
    $name = trim((string) ($body['name'] ?? ''));
    if ($name === '' || mb_strlen($name) > 40) return ['error' => 'name must be 1 to 40 letters', 'name' => mb_substr($name, 0, 50)];
    $text = trim((string) ($body['text'] ?? ''));
    if (mb_strlen($text) < 2 || mb_strlen($text) > 500) return ['error' => 'text must be 2 to 500 letters', 'length' => mb_strlen($text)];
    return null;
}

/** start the login session with safe cookie settings (HttpOnly, SameSite=Lax, ids only from the server) */
function startSession(): void
{
    ini_set('session.use_strict_mode', '1');            // refuse ids the server never made (session fixation)
    session_name('shop_session');
    session_set_cookie_params(['path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
    session_start();
}

/** the logged-in user as server.js /api/me returns it, or null */
function currentUser(): ?array
{
    if (!isset($_SESSION['user'])) return null;
    $u = (require __DIR__ . '/../data/users.php')[$_SESSION['user']] ?? null;
    return $u === null ? null : ['id' => $u['id'], 'name' => $u['name'], 'role' => $u['role']];
}
