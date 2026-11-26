<?php
declare(strict_types=1);
namespace Shop;

/** where orders are kept — it takes and gives Order objects, never rows */
interface OrderRepository
{
    public function nextId(): int;

    public function save(Order $order): void;

    /** @return Order[] oldest first */
    public function all(): array;
}
