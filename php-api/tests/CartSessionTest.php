<?php
declare(strict_types=1);
namespace Shop\Tests;

use Shop\CartSession;

final class CartSessionTest extends TestCase
{
    private function session(): CartSession
    {
        return new CartSession(fn (): string => '11111111-1111-4111-8111-111111111111');   // a fixed id: the test knows it
    }

    public function testNoCookieGivesANewIdAndCookie(): void
    {
        $this->assertSame(['11111111-1111-4111-8111-111111111111', true], $this->session()->open(''));
    }

    public function testOurCookieIsKeptWithoutAFile(): void
    {
        $id = '22222222-2222-4222-8222-222222222222';
        $this->assertSame([$id, false], $this->session()->open($id));
    }

    public function testAForeignCookieIsReplaced(): void
    {
        $this->assertSame(true, $this->session()->open('../../etc/passwd')[1]);
    }
}
