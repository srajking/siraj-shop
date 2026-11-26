<?php
declare(strict_types=1);
namespace Shop;

/** where carts live — the pages ask for a cart by its id and never know if it is a file, a session or a database */
interface CartRepository
{
    public function has(string $cartId): bool;

    /** @return array<int, array{id: int, qty: int, note: string}> the lines, keyed by product id, in the order added */
    public function items(string $cartId): array;

    public function save(string $cartId, array $items): void;
}
