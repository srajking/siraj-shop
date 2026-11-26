<?php
declare(strict_types=1);
namespace Shop;

/** carts in an array — for checks and tools: the same contract as the file store, nothing written */
final class MemoryCartRepository implements CartRepository
{
    private array $carts = [];

    public function has(string $cartId): bool
    {
        return isset($this->carts[$cartId]);
    }

    public function items(string $cartId): array
    {
        return $this->carts[$cartId] ?? [];
    }

    public function save(string $cartId, array $items): void
    {
        $this->carts[$cartId] = array_column(array_values($items), null, 'id');   // keyed by id, like the file store
    }
}
