<?php
declare(strict_types=1);
namespace Shop\Tests;

use Shop\FileCartRepository;

final class FileCartRepositoryTest extends TestCase
{
    public function testACookieCanNeverNameAnotherFile(): void
    {
        $repo = new FileCartRepository(sys_get_temp_dir() . '/carts-test-' . getmypid());
        $this->assertSame(false, $repo->has('../../data/reviews'));
        $this->expectThrows(\InvalidArgumentException::class, fn () => $repo->save('../../data/reviews', []));
    }
}
