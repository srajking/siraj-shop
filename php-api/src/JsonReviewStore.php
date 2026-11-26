<?php
declare(strict_types=1);
namespace Shop;

/** reviews in one JSON file: one writer at a time (lock), replaced whole (rename) */
final class JsonReviewStore implements ReviewStore
{
    public function __construct(
        private readonly string $file,   // where new reviews are written
        private readonly string $seed,   // read until the first review is saved (Node's file)
    ) {}

    public function all(): array
    {
        $file = is_file($this->file) ? $this->file : $this->seed;
        try {
            return json_decode(file_get_contents($file), true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            throw new StoreError('the reviews file is broken', previous: $e);   // say what broke, keep the cause
        }
    }

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
