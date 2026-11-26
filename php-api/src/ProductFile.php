<?php
declare(strict_types=1);
namespace Shop;

/** the products file Node and PHP share: its rows, read like every other data file */
final class ProductFile
{
    use ReadsJson;

    public function __construct(private readonly string $file) {}

    public function rows(): array
    {
        return $this->readJson($this->file);
    }

    protected function what(): string { return 'products'; }
}
