<?php
declare(strict_types=1);
namespace Shop;

/** placing an order: the cart becomes an Order, the order is kept, the cart is emptied — no HTTP here */
final class Checkout
{
    /** @param \Closure(array): array $view the cart lines → the cart as GET /api/cart shows it (names, prices, totals) */
    public function __construct(
        private readonly CartRepository $carts,
        private readonly OrderRepository $orders,
        private readonly \Closure $view,
    ) {}

    public function place(string $cartId, string $user): Order
    {
        $order = Order::place($this->orders->nextId(), $user, ($this->view)($this->carts->items($cartId)));
        $this->orders->save($order);
        $this->carts->save($cartId, []);
        return $order;
    }

    /** @return Order[] */
    public function orders(): array
    {
        return $this->orders->all();
    }
}
