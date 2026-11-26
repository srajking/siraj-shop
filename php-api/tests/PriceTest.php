<?php
declare(strict_types=1);
namespace Shop\Tests;

use Shop\Price;

final class PriceTest extends TestCase
{
    public function testDiscountFrom10000Rounded(): void
    {
        $this->assertSame([9999, 9000, 9001, 17100], array_map(Price::discounted(...), [9999, 10000, 10001, 19000]));
    }

    public function testText(): void
    {
        $this->assertSame('19,000 IQD', Price::text(19000));
    }
}
