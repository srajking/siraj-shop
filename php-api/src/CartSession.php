<?php
declare(strict_types=1);
namespace Shop;

/** which cart a browser has: its "cart" cookie, or a new id — and nothing is written until something is added */
final class CartSession
{
    /** @param \Closure(): string $newId makes a new cart id (random in the shop, fixed in the tests) */
    public function __construct(private readonly \Closure $newId) {}

    /** @return array{0: string, 1: bool} the cart id, and true when the browser needs a new cookie */
    public function open(string $cookie): array
    {
        if (FileCartRepository::isId($cookie)) return [$cookie, false];   // ours (an empty cart has no file yet)
        return [($this->newId)(), true];
    }
}
