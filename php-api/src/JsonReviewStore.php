<?php
declare(strict_types=1);
namespace Shop;

/** reviews in one JSON file: one writer at a time (lock), replaced whole (rename) */
final class JsonReviewStore implements ReviewStore
{
    use ReadsJson;

    public function __construct(
        private readonly string $file,   // where new reviews are written
        private readonly string $seed,   // read until the first review is saved (Node's file)
    ) {}

    public function all(): array
    {
        return $this->readJson(is_file($this->file) ? $this->file : $this->seed);
    }

    protected function what(): string { return 'reviews'; }

    public function add(array $review): array
    {
        $lock = fopen($this->file . '.lock', 'c');
        flock($lock, LOCK_EX);                                   // the next request waits here
        try {
            $all = $this->all();
            $review = ['id' => count($all) + 1] + $review;       // the id rule of server.js
            $all[] = $review;
            $tmp = $this->file . '.' . getmypid() . '.tmp';
            file_put_contents($tmp, json_encode($all, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
            rename($tmp, $this->file);                           // readers see the old file or the new one, never half
            return $review;
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }
}
