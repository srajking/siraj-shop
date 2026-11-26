<?php
declare(strict_types=1);
namespace Shop\Tests;

use Shop\CartProblem;
use Shop\CartService;
use Shop\MemoryCartRepository;

final class CartServiceTest extends TestCase
{
    private const ID = '33333333-3333-4333-8333-333333333333';

    private function cart(): CartService
    {
        return new CartService(new MemoryCartRepository(), $this->catalog());   // a fake store: nothing on disk
    }

    public function testAddingTheSameProductAddsUp(): void
    {
        $c = $this->cart();
        $c->add(self::ID, 3, 1);
        $this->assertSame(['id' => 3, 'qty' => 2, 'note' => ''], $c->add(self::ID, 3, 1));
    }

    public function testNeverAboveTheStock(): void
    {
        $e = $this->expectThrows(CartProblem::class, fn () => $this->cart()->add(self::ID, 3, 4));
        $this->assertSame([409, ['error' => 'not enough stock', 'stock' => 3, 'wanted' => 4]], [$e->status, $e->toArray()]);
    }

    public function testQtyFromOne(): void
    {
        $this->assertSame(422, $this->expectThrows(CartProblem::class, fn () => $this->cart()->add(self::ID, 1, 0))->status);
        $this->assertSame(422, $this->expectThrows(CartProblem::class, fn () => $this->cart()->add(self::ID, 1, '2'))->status);
    }

    public function testUnknownProduct(): void
    {
        $this->assertSame(404, $this->expectThrows(CartProblem::class, fn () => $this->cart()->add(self::ID, 9))->status);
    }

    public function testPutDropsAMissingNotePatchKeepsIt(): void
    {
        $c = $this->cart();
        $c->add(self::ID, 1, 1);
        $c->patch(self::ID, 1, ['note' => 'gift']);
        $this->assertSame(['id' => 1, 'qty' => 1, 'note' => 'gift'], $c->item(self::ID, 1));
        $this->assertSame(['id' => 1, 'qty' => 2], $c->replace(self::ID, 1, ['qty' => 2]));
    }

    public function testRemovedIsNotInCart(): void
    {
        $c = $this->cart();
        $c->add(self::ID, 1);
        $c->remove(self::ID, 1);
        $this->assertSame(404, $this->expectThrows(CartProblem::class, fn () => $c->item(self::ID, 1))->status);
    }
}
