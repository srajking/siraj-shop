<?php
declare(strict_types=1);
namespace Shop;

/** one product and how many — a value: checked once, never changed, compared by what it holds */
final class CartLine
{
    public function __construct(
        public readonly int $productId,
        public readonly int $qty,
    ) {
        if ($qty < 1) throw new InvalidCart("product $productId: quantity must be 1 or more, got $qty");
    }

    /** the same product twice → one line with both quantities (a new line; this one stays) */
    public function plus(self $other): self
    {
        return new self($this->productId, $this->qty + $other->qty);
    }

    public function equals(self $other): bool
    {
        return $this->productId === $other->productId && $this->qty === $other->qty;
    }
}
