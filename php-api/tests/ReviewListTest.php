<?php
declare(strict_types=1);
namespace Shop\Tests;

use Shop\ReviewList;

final class ReviewListTest extends TestCase
{
    private function list(): ReviewList
    {
        return new ReviewList([
            ['id' => 1, 'productId' => 3, 'stars' => 5],
            ['id' => 2, 'productId' => 1, 'stars' => 2],
            ['id' => 3, 'productId' => 3, 'stars' => 4],
        ]);
    }

    public function testCountAndForeach(): void
    {
        $ids = [];
        foreach ($this->list()->forProduct('3') as $r) $ids[] = $r['id'];
        $this->assertSame([2, [1, 3]], [count($this->list()->forProduct('3')), $ids]);
    }

    public function testProductTextLikeNumberInNode(): void
    {
        $this->assertSame(0, count($this->list()->forProduct('3abc')));
        $this->assertSame(2, count($this->list()->forProduct(' 3 ')));
    }

    public function testAverageLikeServerJs(): void
    {
        $this->assertSame(4.5, $this->list()->forProduct('3')->averageStars());
        $this->assertSame(2, $this->list()->forProduct('1')->averageStars());   // whole: 2, not 2.0
        $this->assertSame(null, $this->list()->forProduct('9')->averageStars());
    }

    public function testNewestFirst(): void
    {
        $this->assertSame([3, 2, 1], array_column($this->list()->newestFirst()->toArray(), 'id'));
    }
}
