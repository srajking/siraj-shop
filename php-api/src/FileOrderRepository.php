<?php
declare(strict_types=1);
namespace Shop;

/** orders in one JSON file — one writer at a time, replaced whole (like JsonReviewStore) */
final class FileOrderRepository implements OrderRepository
{
    use ReadsJson;

    public function __construct(private readonly string $file) {}

    public function nextId(): int
    {
        return count($this->rows()) + 1;
    }

    public function save(Order $order): void
    {
        $lock = fopen($this->file . '.lock', 'c');
        flock($lock, LOCK_EX);
        try {
            $rows = $this->rows();
            $rows[] = $order->jsonSerialize();
            $tmp = $this->file . '.' . getmypid() . '.tmp';
            file_put_contents($tmp, json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
            rename($tmp, $this->file);
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    public function all(): array
    {
        return array_map(Order::fromArray(...), $this->rows());   // rows → Order objects
    }

    private function rows(): array
    {
        return is_file($this->file) ? $this->readJson($this->file) : [];
    }

    protected function what(): string { return 'orders'; }
}
