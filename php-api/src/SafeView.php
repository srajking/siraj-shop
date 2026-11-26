<?php
declare(strict_types=1);
namespace Shop;

/** one row for an HTML page: every field read through it comes out as safe text — a name with < > & stays text */
final class SafeView
{
    public function __construct(private readonly array $row) {}

    /** $view->name → the name, escaped for HTML (inside "…" and heredocs too) */
    public function __get(string $field): string
    {
        return htmlspecialchars((string) $this->raw($field), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    public function __isset(string $field): bool
    {
        return array_key_exists($field, $this->row);
    }

    /** the value as it is — to compare or calculate with, never to print */
    public function raw(string $field): mixed
    {
        if (!array_key_exists($field, $this->row)) {   // a typo is an error, not an empty space on the page
            throw new \LogicException("no field '$field' — the fields are: " . implode(', ', array_keys($this->row)));
        }
        return $this->row[$field];
    }
}
