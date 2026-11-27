<?php
declare(strict_types=1);
namespace Shop\Tests;

use Shop\Router;

final class RouterTest extends TestCase
{
    public function testCompileNamesEachPart(): void
    {
        $this->assertSame('#^/api/products/(?P<product>\d+)/reviews$#', Router::compile('/api/products/{product:\d+}/reviews'));
    }

    public function testMatchGivesThePageAndTheNamedParts(): void
    {
        $r = (new Router())->add('/api/cart/items/{id:\d+}', 'api/cart-item.php');
        $this->assertSame(['page' => 'api/cart-item.php', 'params' => ['id' => '7']], $r->match('/api/cart/items/7'));
    }

    public function testTheRuleKeepsWordsOut(): void
    {
        $r = (new Router())->add('/api/products/{id:\d+}', 'api/products.php');
        $this->assertSame([null, null], [$r->match('/api/products/abc'), $r->match('/api/products/3/')]);
    }

    public function testTheShopTableHasEveryUrlOfServerJs(): void
    {
        $this->assertSame(13, count((require __DIR__ . '/../src/routes.php')->list()));
    }
}
