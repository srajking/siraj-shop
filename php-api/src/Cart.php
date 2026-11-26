<?php
declare(strict_types=1);
namespace Shop;

/** the lines of a cart, one per product — a value like its lines: built once by parse(), compared with equals() */
final class Cart
{
    /** @param array<int, CartLine> $lines keyed by product id */
    private function __construct(private readonly array $lines) {}

    /** "3:2,2:3" → a Cart; every pair is whole numbers, every product exists, the same product adds up */
    public static function parse(string $text, Catalog $catalog): self
    {
        $lines = [];
        foreach (explode(',', $text) as $pair) {
            if (!preg_match('/^(\d+):(-?\d+)$/', trim($pair), $m)) throw new InvalidCart("'$pair' is not id:qty");
            $line = new CartLine((int) $m[1], (int) $m[2]);
            if ($catalog->find($line->productId) === null) throw new InvalidCart("no product {$line->productId}");
            $lines[$line->productId] = isset($lines[$line->productId]) ? $lines[$line->productId]->plus($line) : $line;
        }
        return new self($lines);
    }

    /** @return CartLine[] in the order the products were first added */
    public function lines(): array
    {
        return array_values($this->lines);
    }

    /** the same products with the same quantities — in any order */
    public function equals(self $other): bool
    {
        if (count($this->lines) !== count($other->lines)) return false;
        foreach ($this->lines as $id => $line) {
            if (!isset($other->lines[$id]) || !$line->equals($other->lines[$id])) return false;
        }
        return true;
    }
}
