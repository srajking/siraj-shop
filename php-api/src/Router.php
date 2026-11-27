<?php
declare(strict_types=1);
namespace Shop;

/** the URL table of the front controller: '/api/products/{id:\d+}' → the page that answers it; {id} lands in $_GET['id'] */
final class Router
{
    private array $routes = [];

    public function add(string $pattern, string $page): self
    {
        $this->routes[] = [$pattern, $page];
        return $this;
    }

    /** /api/products/{id:\d+} → #^/api/products/(?P<id>\d+)$# — {name} alone means "anything but /" */
    public static function compile(string $pattern): string
    {
        $regex = preg_replace_callback('#\{(\w+)(?::([^}]+))?\}#', fn (array $m): string => '(?P<' . $m[1] . '>' . ($m[2] ?? '[^/]+') . ')', $pattern);
        return '#^' . $regex . '$#';
    }

    /** the first route that matches — specific patterns are added before general ones; null → 404 */
    public function match(string $path): ?array
    {
        foreach ($this->routes as [$pattern, $page]) {
            if (preg_match(self::compile($pattern), $path, $m)) {
                return ['page' => $page, 'params' => array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY)];
            }
        }
        return null;
    }

    /** the table, for people: pattern → page */
    public function list(): array
    {
        return array_map(fn (array $r): string => sprintf('%-37s %s', $r[0], $r[1]), $this->routes);
    }
}
