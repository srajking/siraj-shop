<?php
declare(strict_types=1);
namespace Shop\Tests;

use Shop\CartProblem;
use Shop\Checkout;
use Shop\MemoryCartRepository;
use Shop\Order;

final class OrderTest extends TestCase
{
    private const CART = '44444444-4444-4444-8444-444444444444';

    public function testAnEmptyCartIsNotAnOrder(): void
    {
        $e = $this->expectThrows(CartProblem::class, fn () => Order::place(1, 'سراج', ['items' => [], 'count' => 0, 'subtotal' => 0, 'total' => 0]));
        $this->assertSame([409, ['error' => 'cart is empty']], [$e->status, $e->toArray()]);
    }

    public function testPlacingKeepsTheOrderAndEmptiesTheCart(): void
    {
        $carts = new MemoryCartRepository();
        $carts->save(self::CART, [['id' => 3, 'qty' => 1, 'note' => '']]);
        $view = fn (array $lines): array => ['items' => array_values($lines), 'count' => 1, 'subtotal' => 19000, 'total' => 17100];
        $checkout = new Checkout($carts, $orders = new MemoryOrders(), $view);
        $order = $checkout->place(self::CART, 'سراج');
        $this->assertSame([1, 17100, 1, []], [$order->id, $order->total, count($orders->saved), $carts->items(self::CART)]);
    }

    public function testJsonShapeLikeServerJs(): void
    {
        $o = Order::fromArray(['id' => 7, 'user' => 'سراج', 'items' => [], 'count' => 1, 'subtotal' => 3000, 'total' => 3000]);
        $this->assertSame(['id', 'user', 'items', 'count', 'subtotal', 'total'], array_keys($o->jsonSerialize()));
    }
}
