<?php
declare(strict_types=1);
namespace Shop;

/**
 * The cart rules of server.js, and only them: no HTTP, no files.
 * It gets a CartRepository (any store keeps the same contract) and the Catalog; a broken rule is a CartProblem.
 */
final class CartService
{
    public function __construct(
        private readonly CartRepository $carts,
        private readonly Catalog $catalog,
    ) {}

    /** POST /api/cart/items — the quantity adds up, never above the stock */
    public function add(string $cartId, mixed $productId, mixed $qty = 1): array
    {
        $product = is_int($productId) ? $this->catalog->find($productId) : null;
        if ($product === null) throw new CartProblem(404, ['error' => 'product not found', 'id' => $productId]);
        $this->checkQty($qty);
        $items = $this->carts->items($cartId);
        $now = ($items[$productId]['qty'] ?? 0) + $qty;
        if ($now > $product['stock']) throw new CartProblem(409, ['error' => 'not enough stock', 'stock' => $product['stock'], 'wanted' => $now]);
        $items[$productId] = ['id' => $productId, 'qty' => $now, 'note' => $items[$productId]['note'] ?? ''];
        $this->carts->save($cartId, $items);
        return $items[$productId];
    }

    /** GET /api/cart/items/:id */
    public function item(string $cartId, int $productId): array
    {
        return $this->carts->items($cartId)[$productId] ?? throw new CartProblem(404, ['error' => 'not in cart', 'id' => $productId]);
    }

    /** PUT — the line becomes exactly {id, qty, note}; a missing note is left out, like JSON.stringify drops undefined */
    public function replace(string $cartId, int $productId, array $body): array
    {
        $this->item($cartId, $productId);
        return $this->store($cartId, array_filter(['id' => $productId, 'qty' => $body['qty'] ?? null, 'note' => $body['note'] ?? null], fn ($v) => $v !== null));
    }

    /** PATCH — {...item, ...body, id} */
    public function patch(string $cartId, int $productId, array $body): array
    {
        return $this->store($cartId, ['id' => $productId] + array_merge($this->item($cartId, $productId), $body, ['id' => $productId]));
    }

    /** DELETE /api/cart/items/:id */
    public function remove(string $cartId, int $productId): void
    {
        $this->item($cartId, $productId);
        $items = $this->carts->items($cartId);
        unset($items[$productId]);
        $this->carts->save($cartId, $items);
    }

    private function store(string $cartId, array $line): array
    {
        $this->checkQty($line['qty'] ?? null);
        $items = $this->carts->items($cartId);
        $items[$line['id']] = $line;
        $this->carts->save($cartId, $items);
        return $line;
    }

    private function checkQty(mixed $qty): void
    {
        if (!is_int($qty) || $qty < 1) throw new CartProblem(422, ['error' => 'qty must be a whole number from 1', 'qty' => $qty]);
    }
}
