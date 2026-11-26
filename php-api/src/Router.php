<?php
declare(strict_types=1);
namespace Shop;

/** the URL table of the front controller: a pattern → the page that answers it, and the name of the number in the path */
final class Router
{
    private array $routes = [];

    public function add(string $pattern, string $page, ?string $param = null): self
    {
        $this->routes[] = [$pattern, $page, $param];
        return $this;
    }

    /** the first route that matches — specific patterns are added before general ones; null → 404 */
    public function match(string $path): ?array
    {
        foreach ($this->routes as [$pattern, $page, $param]) {
            if (preg_match($pattern, $path, $m)) return ['page' => $page, 'params' => $param ? [$param => $m[1]] : []];
        }
        return null;
    }
}
