<?php
declare(strict_types=1);
namespace Shop\Tests;

use Shop\Cart;
use Shop\InvalidCart;

final class CartTest extends TestCase
{
    public function testTheSameProductIsOneLine(): void
    {
        $lines = Cart::parse('3:1,3:1', $this->catalog())->lines();
        $this->assertSame([1, 2], [count($lines), $lines[0]->qty]);
    }

    public function testEqualInAnyOrder(): void
    {
        $this->assertSame(true, Cart::parse('3:1,1:2', $this->catalog())->equals(Cart::parse('1:2,3:1', $this->catalog())));
    }

    public function testBadTextIsInvalidCart(): void
    {
        foreach (['3:-2', '9:1', '3:x', '3:2.5', ''] as $text) {
            $this->expectThrows(InvalidCart::class, fn () => Cart::parse($text, $this->catalog()));
        }
    }
}
