<?php
declare(strict_types=1);
namespace Shop;

/** a cart request that breaks a rule (no such product, a bad qty, not enough stock, not in the cart) — the status and body server.js sends */
final class CartProblem extends ShopError
{
    public function __construct(public readonly int $status, private readonly array $body)
    {
        parent::__construct($body['error'], $status);
    }

    public function toArray(): array
    {
        return $this->body;
    }
}
