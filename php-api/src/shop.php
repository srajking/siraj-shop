<?php
declare(strict_types=1);
// src/shop.php — the shop's data and rules, written once. Every page and tool requires it:
//   require __DIR__ . '/../src/shop.php';
// It is outside public/, so no one can request it from the browser.

const SHOP = 'Siraj Shop';

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
        // a data problem: say what to fix (exit 2); anything else is a bug: see the log (exit 1)
        if ($e instanceof Shop\DataError) {
            fwrite(STDERR, 'data error: ' . $e->getMessage() . "\n");
            exit(2);
        }
        fwrite(STDERR, "error $id — see the log\n");
        exit(1);
    }
    sendJson(500, ['error' => 'server error', 'requestId' => $id]);
});

/** one row of products.json → a Product: the keys become named arguments — a wrong type or a missing field stops here */
function productFrom(array $row): Shop\Product
{
    // the category text becomes a Category case — a value not in the list stops here
    try {
        return new Shop\Product(...['category' => Shop\Category::from($row['category'])] + $row);
    } catch (TypeError|ValueError|ArgumentCountError $e) {   // PHP's own errors about this row → one shop error
        throw new Shop\InvalidProduct('product ' . ($row['id'] ?? '?') . ': ' . $e->getMessage(), previous: $e);
    }
}

// the products come from the same file Node reads — one list for both servers
const PRODUCTS_FILE = __DIR__ . '/../../server/data/products.json';

/** the one catalog of this request, built on first use: a page that never asks for products never reads the file */
function catalog(): Shop\Catalog
{
    static $catalog = null;
    return $catalog ??= new Shop\Catalog(new Shop\ProductFile(PRODUCTS_FILE));
}

const REVIEWS_FILE = __DIR__ . '/../data/reviews.json';   // the PHP shop's reviews (not committed)

/** "3:2,2:3" → items with id, name, price, qty */
function parseCart(string $text): array
{
    $items = [];
    foreach (explode(',', $text) as $pair) {
        [$id, $qty] = array_map('intval', explode(':', $pair));
        $p = catalog()->find($id);
        $items[] = ['id' => $id, 'name' => $p['name'], 'price' => $p['price'], 'qty' => $qty];
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
        'total'    => Shop\Price::discounted($subtotal),
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
    $list = array_values(catalog()->all());
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

/** the one place that decides where reviews live; SHOP_REVIEWS points the checks at a file of their own */
function reviewStore(): Shop\ReviewStore
{
    static $store = null;
    return $store ??= new Shop\JsonReviewStore(getenv('SHOP_REVIEWS') ?: REVIEWS_FILE, __DIR__ . '/../../server/data/reviews.json');
}

/** all reviews */
function reviews(): array
{
    return reviewStore()->all();
}

/** save a review and return it with its id */
function addReview(array $review): array
{
    return reviewStore()->add($review);
}

/** a page cursor like server.js: "id:239" in base64url — the client treats it as an opaque string */
function cursorOf(int $id): string
{
    return rtrim(strtr(base64_encode("id:$id"), '+/', '-_'), '=');
}

/** the id inside a cursor, or null when it is not one of ours */
function cursorId(string $cursor): ?int
{
    $raw = base64_decode(strtr($cursor, '-_', '+/'), true);
    return is_string($raw) && preg_match('/^id:(\d+)$/', $raw, $m) && (int) $m[1] > 0 ? (int) $m[1] : null;
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
