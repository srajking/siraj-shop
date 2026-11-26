<?php
declare(strict_types=1);
namespace Shop;

/** where reviews live — the pages only know these two methods, not the file behind them */
interface ReviewStore
{
    /** every review, oldest first */
    public function all(): array;

    /** save one review and return it with its new id */
    public function add(array $review): array;
}
