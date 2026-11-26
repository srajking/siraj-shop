<?php
declare(strict_types=1);
namespace Shop\Tests;

/** what every test can say — a failed check throws Failed, the runner counts it */
abstract class TestCase
{
    protected function assertSame(mixed $want, mixed $got, string $what = ''): void
    {
        if ($want !== $got) {
            throw new Failed(($what ? "$what: " : '') . 'want ' . var_export($want, true) . ', got ' . var_export($got, true));
        }
    }

    /** the code must throw $class; returns the exception to check more */
    protected function expectThrows(string $class, callable $fn): \Throwable
    {
        try {
            $fn();
        } catch (\Throwable $e) {
            if ($e instanceof $class) return $e;
            throw new Failed("want $class, got " . $e::class . ': ' . $e->getMessage());
        }
        throw new Failed("want $class, nothing was thrown");
    }

    /** a catalog from the test file — the tests never read the shop's real data */
    protected function catalog(): \Shop\Catalog
    {
        return new \Shop\Catalog(new \Shop\ProductFile(__DIR__ . '/products.json'));
    }
}
