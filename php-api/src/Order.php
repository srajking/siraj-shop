<?php
declare(strict_types=1);
namespace Shop;

/** a placed order — a domain object: built only by place(), never changed, sent in the shape of server.js */
final class Order implements \JsonSerializable
{
    private function __construct(
        public readonly int $id,
        public readonly string $user,
        public readonly array $items,        // the cart lines as GET /api/cart shows them
        public readonly int $count,
        public readonly int $subtotal,
        public readonly int $total,
    ) {}

    /** the rule of server.js: an empty cart is not an order */
    public static function place(int $id, string $user, array $cartView): self
    {
        if ($cartView['count'] < 1) throw new CartProblem(409, ['error' => 'cart is empty']);
        return new self($id, $user, $cartView['items'], $cartView['count'], $cartView['subtotal'], $cartView['total']);
    }

    /** back from storage: the same object that was saved */
    public static function fromArray(array $row): self
    {
        return new self($row['id'], $row['user'], $row['items'], $row['count'], $row['subtotal'], $row['total']);
    }

    /** {id, user, items, count, subtotal, total} — like { id, user: …, ...view } in server.js */
    public function jsonSerialize(): array
    {
        return ['id' => $this->id, 'user' => $this->user, 'items' => $this->items, 'count' => $this->count, 'subtotal' => $this->subtotal, 'total' => $this->total];
    }
}
