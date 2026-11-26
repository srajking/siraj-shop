<?php
declare(strict_types=1);
namespace Shop\Tests;

use Shop\Order;
use Shop\OrderRepository;

/** orders kept in an array — a fake for the tests */
final class MemoryOrders implements OrderRepository
{
    public array $saved = [];
    public function nextId(): int { return count($this->saved) + 1; }
    public function save(Order $o): void { $this->saved[] = $o; }
    public function all(): array { return $this->saved; }
}
