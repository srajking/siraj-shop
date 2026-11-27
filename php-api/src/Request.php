<?php
declare(strict_types=1);
namespace Shop;

/** what the browser sent, read once: method, path, query, headers, body — and made by hand in the tests */
final class Request
{
    public function __construct(
        private string $method,
        private string $path,
        private array $query = [],
        private array $headers = [],
        private string $body = '',
    ) {}

    public static function fromGlobals(): self
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) $headers[strtolower(strtr(substr($key, 5), '_', '-'))] = $value;
        }
        if (isset($_SERVER['CONTENT_TYPE'])) $headers['content-type'] = $_SERVER['CONTENT_TYPE'];
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
        return new self($_SERVER['REQUEST_METHOD'] ?? 'GET', $path, $_GET, $headers, (string) file_get_contents('php://input'));
    }

    public function method(): string { return $this->method; }
    public function path(): string { return $this->path; }
    public function body(): string { return $this->body; }

    /** header names are case-insensitive: Content-Type = content-type */
    public function header(string $name): ?string
    {
        return $this->headers[strtolower($name)] ?? null;
    }

    /** a text value from ?key= — an array (?key[]=) counts as missing */
    public function query(string $key, ?string $default = null): ?string
    {
        $value = $this->query[$key] ?? null;
        return is_string($value) ? $value : $default;
    }

    /** a whole number from 1 up, or null: "3abc", "-1", "0" and ?id[]= are all null */
    public function int(string $key): ?int
    {
        $value = filter_var($this->query($key), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        return $value === false ? null : $value;
    }
}
