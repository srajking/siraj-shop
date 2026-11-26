<?php
declare(strict_types=1);
namespace Shop;

/** reviews as one collection — count() and foreach work on it, and the rules of server.js filter and sum it */
final class ReviewList implements \Countable, \IteratorAggregate
{
    /** @param array[] $reviews rows like the reviews file */
    public function __construct(private readonly array $reviews) {}

    /** ?product= like server.js: Number(text) — "3abc" is not a number, so it matches no review */
    public function forProduct(string $text): self
    {
        if ($text === '') return $this;                               // no filter, like an empty param in Node
        $n = is_numeric($text) ? (float) $text : NAN;                 // NAN equals nothing
        return new self(array_values(array_filter($this->reviews, fn (array $r): bool => $r['productId'] == $n)));
    }

    public function newestFirst(): self
    {
        $list = $this->reviews;
        usort($list, fn (array $a, array $b): int => $b['id'] <=> $a['id']);
        return new self($list);
    }

    public function count(): int
    {
        return count($this->reviews);
    }

    /** foreach ($list as $i => $review) — one review at a time */
    public function getIterator(): \Generator
    {
        yield from $this->reviews;
    }

    /** the average stars to one decimal, like Math.round(10 * avg) / 10 — a whole number stays whole; none → null */
    public function averageStars(): int|float|null
    {
        if ($this->reviews === []) return null;
        $avg = round(10 * array_sum(array_column($this->reviews, 'stars')) / count($this->reviews)) / 10;
        return $avg == (int) $avg ? (int) $avg : $avg;
    }

    public function toArray(): array
    {
        return $this->reviews;
    }
}
